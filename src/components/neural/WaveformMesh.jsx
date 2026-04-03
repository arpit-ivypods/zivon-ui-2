import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  WAVE_WIDTH, WAVE_DEPTH, WAVE_SEG_X, WAVE_SEG_Z,
  COLOR_LEFT, COLOR_CENTER, COLOR_RIGHT,
  HDR_LEFT, HDR_CENTER, HDR_RIGHT,
} from './constants'

/**
 * Build a single waveform layer geometry with vertex colors.
 * @param {number} yOffset   — vertical offset for stacking layers
 * @param {number} phaseShift — phase offset so layers undulate differently
 */
function useWaveformGeometry(yOffset = 0) {
  return useMemo(() => {
    const geom = new THREE.PlaneGeometry(
      WAVE_WIDTH, WAVE_DEPTH,
      WAVE_SEG_X, WAVE_SEG_Z
    )
    geom.rotateX(-Math.PI / 2)

    // Shift all vertices by yOffset
    const pos = geom.attributes.position
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) + yOffset)
    }

    // ─── Vertex Colors ───
    const colors = new Float32Array(pos.count * 3)
    const halfW = WAVE_WIDTH / 2

    const tmpA = new THREE.Color()
    const tmpB = new THREE.Color()
    const mixed = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const t = (x + halfW) / WAVE_WIDTH

      let hdr
      if (t <= 0.5) {
        const mixT = t / 0.5
        tmpA.copy(COLOR_LEFT)
        tmpB.copy(COLOR_CENTER)
        mixed.lerpColors(tmpA, tmpB, mixT)
        hdr = HDR_LEFT + (HDR_CENTER - HDR_LEFT) * mixT
      } else {
        const mixT = (t - 0.5) / 0.5
        tmpA.copy(COLOR_CENTER)
        tmpB.copy(COLOR_RIGHT)
        mixed.lerpColors(tmpA, tmpB, mixT)
        hdr = HDR_CENTER + (HDR_RIGHT - HDR_CENTER) * mixT
      }

      colors[i * 3]     = mixed.r * hdr
      colors[i * 3 + 1] = mixed.g * hdr
      colors[i * 3 + 2] = mixed.b * hdr
    }

    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geom
  }, [yOffset])
}

/**
 * A single waveform layer that animates each frame.
 */
function WaveformLayer({ yOffset = 0, phaseShift = 0, amplitudeScale = 1, opacity = 0.85, speed = 1 }) {
  const meshRef = useRef()
  const geometry = useWaveformGeometry(yOffset)
  const virtualTime = useRef(0)       // accumulated time — never jumps
  const currentSpeed = useRef(speed)   // smoothly interpolated speed

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Smoothly lerp current speed toward target (no abrupt change)
    currentSpeed.current += (speed - currentSpeed.current) * Math.min(1, delta * 3)
    // Accumulate virtual time — only the RATE changes, never the position
    virtualTime.current += delta * currentSpeed.current

    const t = virtualTime.current
    const ps = phaseShift
    const amp = amplitudeScale
    const pos = meshRef.current.geometry.attributes.position

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      // Main soundwave — dramatic peaks, sharper frequency
      const wave1 = 0.8 * amp * Math.sin(x * 1.8 + t * 0.7 + ps)
                       * Math.cos(z * 0.6 + t * 0.3)

      // Secondary harmonic — adds complexity
      const wave2 = 0.35 * amp * Math.sin(x * 1.0 - t * 0.5 + ps * 1.3 + z * 0.8)

      // High-frequency detail
      const wave3 = 0.15 * amp * Math.sin(x * 3.2 + t * 1.1 + ps * 0.7)
                       * Math.cos(z * 1.5 - t * 0.4)

      // Pseudo-noise turbulence
      const noise =
        0.1 * amp * Math.sin(x * 2.3 + t * 0.4 + ps) * Math.sin(z * 1.7 + t * 0.3) +
        0.05 * amp * Math.sin(x * 4.1 - t * 0.7) * Math.sin(z * 3.3 + t * 0.5)

      pos.setY(i, yOffset + wave1 + wave2 + wave3 + noise)
    }
    pos.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        wireframe
        vertexColors
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </mesh>
  )
}

/**
 * Central waveform: 3 stacked layers at different phases/offsets
 * creating the rich overlapping ribbon look from the reference.
 */
const LAYER_CONFIGS = [
  { yOffset: 0,     phaseShift: 0,   amplitudeScale: 1.0, opacity: 0.9 },
  { yOffset: 0.15,  phaseShift: 1.2, amplitudeScale: 0.7, opacity: 0.55 },
  { yOffset: -0.15, phaseShift: 2.5, amplitudeScale: 0.6, opacity: 0.45 },
]

export default function WaveformMesh({ speed = 1, amplitude = 1, layers = 3 }) {
  const count = Math.min(Math.max(1, layers), 3)
  return (
    <group>
      {LAYER_CONFIGS.slice(0, count).map((cfg, i) => (
        <WaveformLayer
          key={i}
          {...cfg}
          amplitudeScale={cfg.amplitudeScale * amplitude}
          speed={speed}
        />
      ))}
    </group>
  )
}
