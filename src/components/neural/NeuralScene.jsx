import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import NeuralWaveform from './NeuralWaveform'
import { BG_COLOR } from './constants'

const SPEEDS = [
  { label: '0.5×', value: 0.5 },
  { label: '1×',   value: 1.0 },
  { label: '2×',   value: 2.0 },
  { label: '4×',   value: 4.0 },
]

export default function NeuralScene() {
  const [speedIdx, setSpeedIdx] = useState(1) // default 1×

  const cycle = () => setSpeedIdx((prev) => (prev + 1) % SPEEDS.length)
  const { label, value } = SPEEDS[speedIdx]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{
          position: [0, 1.8, 6.5],
          fov: 52,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
        }}
        style={{ background: BG_COLOR }}
      >
        <color attach="background" args={[BG_COLOR]} />
        <fog attach="fog" args={[BG_COLOR, 12, 30]} />

        <ambientLight intensity={0.05} color="#e0e0ff" />

        <NeuralWaveform speed={value} />

        <OrbitControls
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
          minDistance={3.5}
          maxDistance={14}
          enablePan={false}
          maxPolarAngle={Math.PI * 0.6}
          minPolarAngle={Math.PI * 0.35}
          enableRotate={false}
        />

        <EffectComposer>
          <Bloom
            intensity={3.5}
            luminanceThreshold={0.02}
            luminanceSmoothing={0.8}
            mipmapBlur
            radius={0.95}
          />
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.05}
            bokehScale={3.5}
            height={480}
          />
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

      {/* Speed toggle button — HTML overlay */}
      <button
        onClick={cycle}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
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
    </div>
  )
}
