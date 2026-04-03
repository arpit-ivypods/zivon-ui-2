import { Suspense, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import PipeBundles from './pipeline/PipeBundles'
import HudNodesGroup from './pipeline/HudNodesGroup'
import PipeParticles from './pipeline/PipeParticles'
import HudLabels from './pipeline/HudLabels'
import AmbientParticles from '../../neural-nexus/canvas/environment/AmbientParticles'
import LightingV2 from './environment/LightingV2'
import PostProcessingV2 from './environment/PostProcessingV2'

class R3FErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.warn(`[R3F-V2] ${this.props.name}:`, err.message) }
  render() { return this.state.hasError ? null : this.props.children }
}

function Safe({ name, children }) {
  return (
    <R3FErrorBoundary name={name}>
      <Suspense fallback={null}>{children}</Suspense>
    </R3FErrorBoundary>
  )
}

export default function SceneV2() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 1.5, 14], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
      >
        <color attach="background" args={['#050B14']} />
        <Safe name="Lighting"><LightingV2 /></Safe>

        <group position={[-2.5, 0, 0]}>
          {/* No bar chart — deleted per Round 3 */}
          <Safe name="PipeBundles"><PipeBundles /></Safe>
          <Safe name="Particles"><PipeParticles /></Safe>
          <Safe name="HudNodes"><HudNodesGroup /></Safe>
          <Safe name="HudLabels"><HudLabels /></Safe>
        </group>

        <Safe name="AmbientParticles"><AmbientParticles /></Safe>
        <Safe name="PostProcessing"><PostProcessingV2 /></Safe>
      </Canvas>
    </div>
  )
}
