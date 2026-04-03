import { useRef, useEffect } from 'react'
import { createNoise3D } from 'simplex-noise'
import { colors } from '../../utils/colors'
import useDashboardStore from '../../store/useDashboardStore'

function lerpRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

const COL_CYAN = [0, 229, 255]
const COL_PURPLE = [157, 78, 221]
const COL_ORANGE = [255, 180, 50]
const COL_PINK = [220, 120, 255]

// Each layer is a narrow ribbon of wireframe rows centered on the midline
const LAYERS = [
  { ampScale: 1.0, freqX: 2.2, freqT: 0.8, bandRows: 12, color1: COL_PURPLE, color2: COL_ORANGE, opacity: 0.8, phase: 0, bandHeight: 0.12 },
  { ampScale: 0.8, freqX: 1.6, freqT: 0.6, bandRows: 10, color1: COL_CYAN, color2: COL_PINK, opacity: 0.55, phase: 1.0, bandHeight: 0.10 },
  { ampScale: 0.55, freqX: 3.0, freqT: 1.0, bandRows: 8, color1: COL_ORANGE, color2: COL_CYAN, opacity: 0.35, phase: 2.2, bandHeight: 0.08 },
]

const VoicePanel = () => {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const noiseRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    noiseRef.current = createNoise3D()

    const cols = 90
    let running = true
    let currentAmplitude = 0.4
    let currentSpeed = 1.0
    let smoothTime = 0 // accumulated time with variable speed

    const loop = () => {
      if (!running) return
      const rawTime = performance.now() / 1000
      const voiceState = useDashboardStore.getState().voiceState
      const targetAmplitude = useDashboardStore.getState().voiceAmplitude
      // Speaking: 20% more amplitude, 30% faster
      const isSpeaking = voiceState === 'humanSpeaking' || voiceState === 'aiSpeaking'
      const targetAmp = isSpeaking ? targetAmplitude * 1.2 : targetAmplitude
      const targetSpd = isSpeaking ? 2.3 : 1.0
      // Smooth lerp (~500ms transition at 60fps)
      currentAmplitude += (targetAmp - currentAmplitude) * 0.03
      currentSpeed += (targetSpd - currentSpeed) * 0.03
      // Accumulate time with smooth speed factor
      smoothTime += (1 / 60) * currentSpeed
      const time = smoothTime
      const amplitude = currentAmplitude
      const rect = canvas.parentElement.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) { animRef.current = requestAnimationFrame(loop); return }

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const w = rect.width
      const h = rect.height
      const noise = noiseRef.current
      const midY = h * 0.5

      ctx.clearRect(0, 0, w, h)

      const peakNodes = []
      const padX = w * 0.04

      for (const layer of LAYERS) {
        const rows = layer.bandRows
        const bandH = h * layer.bandHeight // narrow band height for the flat ribbon
        const cellW = (w - padX * 2) / cols

        const grid = []
        for (let iy = 0; iy <= rows; iy++) {
          const row = []
          for (let ix = 0; ix <= cols; ix++) {
            const nx = (ix / cols) * 8 - 4 // wider range for more wave cycles

            // Core wave displacement - this creates the tall peaks and deep troughs
            const wave1 = Math.sin(nx * layer.freqX + time * layer.freqT + layer.phase) * 0.5
            const wave2 = Math.sin(nx * 0.9 + time * 0.4 + layer.phase * 0.6) * 0.25
            const noiseVal = noise(nx * 0.3, iy * 0.3, time * 0.2 + layer.phase) * 0.3
            // Clamp amplitude so visual stays contained (0.35-0.55 range)
            const clampedAmp = 0.35 + Math.min(amplitude, 1.2) * 0.17
            const displacement = (wave1 + wave2 + noiseVal) * clampedAmp * layer.ampScale

            const x = padX + ix * cellW
            // iy spreads rows within a narrow band, displacement moves them up/down
            const bandOffset = ((iy / rows) - 0.5) * bandH
            const y = midY + bandOffset + displacement * h * 0.28

            const t = Math.max(0, Math.min(1, (displacement + 0.4) / 0.8))
            const color = lerpRgb(layer.color1, layer.color2, t)

            row.push({ x, y, color, displacement })

            // Constellation nodes at peaks
            if (Math.abs(displacement) > 0.12 && ix % 6 === 0 && iy % 3 === 0) {
              const brightness = Math.min(1, (Math.abs(displacement) - 0.1) * 2.0)
              peakNodes.push({ x, y, brightness, color })
            }
          }
          grid.push(row)
        }

        // Horizontal wireframe lines
        ctx.lineWidth = 0.6
        for (let iy = 0; iy <= rows; iy++) {
          for (let ix = 0; ix < cols; ix++) {
            const p1 = grid[iy][ix]
            const p2 = grid[iy][ix + 1]
            const avgD = (p1.displacement + p2.displacement) / 2
            const t = Math.max(0, Math.min(1, (avgD + 0.6) / 1.2))
            const c = lerpRgb(layer.color1, layer.color2, t)
            const a = (0.2 + t * 0.6) * layer.opacity
            ctx.strokeStyle = `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }

        // Vertical wireframe lines (every other column for depth)
        ctx.lineWidth = 0.4
        for (let ix = 0; ix <= cols; ix += 2) {
          for (let iy = 0; iy < rows; iy++) {
            const p1 = grid[iy][ix]
            const p2 = grid[iy + 1][ix]
            const avgD = (p1.displacement + p2.displacement) / 2
            const t = Math.max(0, Math.min(1, (avgD + 0.6) / 1.2))
            const c = lerpRgb(layer.color1, layer.color2, t)
            const a = (0.1 + t * 0.4) * layer.opacity
            ctx.strokeStyle = `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Constellation lines between nearby peaks
      ctx.lineWidth = 0.6
      for (let i = 0; i < peakNodes.length; i++) {
        for (let j = i + 1; j < peakNodes.length; j++) {
          const a = peakNodes[i], b = peakNodes[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < w * 0.2 && dist > 15) {
            const fade = 1 - dist / (w * 0.2)
            const alpha = fade * (a.brightness + b.brightness) * 0.15
            const c = lerpRgb(a.color, b.color, 0.5)
            ctx.strokeStyle = `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Glowing constellation nodes
      for (const node of peakNodes) {
        const { x, y, brightness, color } = node
        const size = 1.2 + brightness * 2.0

        // Soft outer glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
        grad.addColorStop(0, `rgba(${color[0]|0},${color[1]|0},${color[2]|0},${brightness * 0.5})`)
        grad.addColorStop(0.4, `rgba(${color[0]|0},${color[1]|0},${color[2]|0},${brightness * 0.12})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, size * 4, 0, Math.PI * 2)
        ctx.fill()

        // White hot core
        ctx.fillStyle = `rgba(255,255,255,${brightness * 0.95})`
        ctx.beginPath()
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Colored mid ring
        ctx.fillStyle = `rgba(${color[0]|0},${color[1]|0},${color[2]|0},${brightness * 0.8})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(loop)
    }

    loop()
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <div
      style={{
        height: 220,
        background: colors.panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}
    >
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: colors.textPrimary, letterSpacing: '0.06em' }}>
        REAL-TIME INTERACTION
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: colors.cyanPrimary, letterSpacing: '0.04em' }}>
        HUMAN-AI VOICE CONVERSATION
      </div>
      <div
        style={{
          flex: 1,
          borderRadius: 6,
          border: `1px solid ${colors.panelBorder}`,
          background: 'rgba(3, 5, 15, 0.85)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: colors.textMuted, letterSpacing: '0.08em', position: 'absolute', top: 6, left: 8, zIndex: 1 }}>
          VOICE WAVEFORM
        </div>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

export default VoicePanel
