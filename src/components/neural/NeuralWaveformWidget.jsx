import { useState, useMemo, createContext, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import WaveformMesh from './WaveformMesh'
import NeuralMesh from './NeuralMesh'
import VoidParticles from './VoidParticles'

// ─── Theme context so sub-components can read colors without prop-drilling ───
const ThemeCtx = createContext(null)
export const useNeuralTheme = () => useContext(ThemeCtx)

const SPEED_PRESETS = [
  { label: '0.5×', value: 0.5 },
  { label: '1×',   value: 1.0 },
  { label: '2×',   value: 2.0 },
  { label: '4×',   value: 4.0 },
]

/**
 * NeuralWaveformWidget — a self-contained, reusable 3D waveform visualization.
 *
 * Drop it into any React app or dashboard. It renders its own Canvas,
 * post-processing, and optional speed-toggle button.
 *
 * @example
 * // Minimal — fills its parent container
 * <NeuralWaveformWidget />
 *
 * @example
 * // Dashboard card with custom size and theme
 * <div style={{ width: 600, height: 400 }}>
 *   <NeuralWaveformWidget
 *     colorLeft="#ff00ff"
 *     colorCenter="#ffaa00"
 *     colorRight="#00ccff"
 *     showSpeedControl={false}
 *     initialSpeed={1.5}
 *     backgroundNodes={60}
 *     bloomIntensity={2.5}
 *   />
 * </div>
 *
 * @param {object} props
 *
 * --- Layout ---
 * @param {string}  [className]         — CSS class on the wrapper div
 * @param {object}  [style]             — inline style on the wrapper div
 *
 * --- Colors (hex strings or THREE.Color-compatible) ---
 * @param {string}  [colorLeft='#8c00ff']    — left-side gradient color (purple)
 * @param {string}  [colorCenter='#ffb307']  — center gradient color (gold)
 * @param {string}  [colorRight='#00e5ff']   — right-side gradient color (cyan)
 * @param {string}  [bgColor='#0a0a1a']      — background color
 *
 * --- Waveform ---
 * @param {number}  [initialSpeed=1]     — starting animation speed multiplier
 * @param {number}  [waveAmplitude=1]    — overall wave height multiplier
 * @param {number}  [waveLayers=3]       — number of stacked waveform ribbons (1-3)
 *
 * --- Background mesh ---
 * @param {number}  [backgroundNodes=90] — number of background constellation nodes
 * @param {boolean} [showMesh=true]      — show/hide background neural mesh
 * @param {boolean} [showParticles=true] — show/hide void dust particles
 *
 * --- Post-processing ---
 * @param {number}  [bloomIntensity=3.5] — bloom glow intensity
 * @param {boolean} [depthOfField=true]  — enable/disable depth of field
 *
 * --- Controls ---
 * @param {boolean} [showSpeedControl=true]  — show the speed toggle button
 * @param {boolean} [interactive=false]      — allow orbit/zoom with mouse
 */
export default function NeuralWaveformWidget({
  // Layout
  className,
  style,

  // Colors
  colorLeft    = '#8c00ff',
  colorCenter  = '#ffb307',
  colorRight   = '#00e5ff',
  bgColor      = '#0a0a1a',

  // Waveform
  initialSpeed   = 1,
  waveAmplitude  = 1,
  waveLayers     = 3,

  // Background
  backgroundNodes = 90,
  showMesh        = true,
  showParticles   = true,

  // Post-processing
  bloomIntensity = 3.5,
  depthOfField   = true,

  // Controls
  showSpeedControl = true,
  interactive      = false,
}) {
  const [speedIdx, setSpeedIdx] = useState(
    SPEED_PRESETS.findIndex((s) => s.value >= initialSpeed) ?? 1
  )
  const cycle = () => setSpeedIdx((p) => (p + 1) % SPEED_PRESETS.length)
  const { label, value } = SPEED_PRESETS[speedIdx >= 0 ? speedIdx : 1]

  // Resolve color props to THREE.Color once
  const theme = useMemo(() => ({
    left:   new THREE.Color(colorLeft),
    center: new THREE.Color(colorCenter),
    right:  new THREE.Color(colorRight),
    bg:     bgColor,
  }), [colorLeft, colorCenter, colorRight, bgColor])

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'inherit',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.8, 6.5], fov: 52, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ background: theme.bg }}
      >
        <color attach="background" args={[theme.bg]} />
        <fog attach="fog" args={[theme.bg, 12, 30]} />
        <ambientLight intensity={0.05} color="#e0e0ff" />

        <ThemeCtx.Provider value={theme}>
          <group>
            {showParticles && <VoidParticles />}
            {showMesh && <NeuralMesh speed={value} nodeCount={backgroundNodes} />}
            <WaveformMesh speed={value} amplitude={waveAmplitude} layers={waveLayers} />
          </group>
        </ThemeCtx.Provider>

        <OrbitControls
          autoRotate={false}
          enableRotate={interactive}
          enableZoom={interactive}
          enableDamping
          dampingFactor={0.05}
          minDistance={3.5}
          maxDistance={14}
          enablePan={false}
          maxPolarAngle={Math.PI * 0.6}
          minPolarAngle={Math.PI * 0.35}
        />

        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.02}
            luminanceSmoothing={0.8}
            mipmapBlur
            radius={0.95}
          />
          {depthOfField && (
            <DepthOfField
              focusDistance={0.02}
              focalLength={0.05}
              bokehScale={3.5}
              height={480}
            />
          )}
          <ChromaticAberration
            offset={[0.0006, 0.0006]}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette
            offset={0.2}
            darkness={0.9}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>
      </Canvas>

      {showSpeedControl && (
        <button
          onClick={cycle}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            color: '#e0e0ff',
            fontSize: 13,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.04em',
            padding: '8px 18px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
          }}
        >
          Wave Speed: {label}
        </button>
      )}
    </div>
  )
}
