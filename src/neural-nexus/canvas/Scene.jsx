import { Suspense, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import DataSplines from './pipeline/DataSplines'
import EngineNodesGroup from './pipeline/EngineNodesGroup'
import DataParticles from './pipeline/DataParticles'
import PipelineChartBars from './pipeline/PipelineChartBars'
import AmbientParticles from './environment/AmbientParticles'
import Lighting from './environment/Lighting'
import PostProcessing from './environment/PostProcessing'

class R3FErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    console.warn(`[R3F] ${this.props.name} failed:`, err.message)
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function Safe({ name, children }) {
  return (
    <R3FErrorBoundary name={name}>
      <Suspense fallback={null}>{children}</Suspense>
    </R3FErrorBoundary>
  )
}

export default function Scene() {
  // Sidebar is ~25% of screen on right, so shift all content left by ~2.5 world units
  // to center the pipeline in the main stage area (left 75%)
  const contentOffsetX = -2.5

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
    }}>
      <Canvas
        camera={{ position: [0, 1.5, 14], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
      >
        <color attach="background" args={['#050B14']} />

        <Safe name="Lighting"><Lighting /></Safe>

        {/* All pipeline content shifted left to center in main stage area */}
        <group position={[contentOffsetX, 0, 0]}>
          <Safe name="ChartBars"><PipelineChartBars /></Safe>
          <Safe name="Splines"><DataSplines /></Safe>
          <Safe name="Particles"><DataParticles /></Safe>
          <Safe name="EngineNodes"><EngineNodesGroup /></Safe>
        </group>

        {/* Background atmosphere stays centered on full viewport */}
        <Safe name="AmbientParticles"><AmbientParticles /></Safe>

        <Safe name="PostProcessing"><PostProcessing /></Safe>
      </Canvas>
    </div>
  )
}
