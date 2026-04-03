import { Suspense, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import EnergySplines from './pipeline/EnergySplines'
import HudNodesGroup from './pipeline/HudNodesGroup'
import EnergyParticles from './pipeline/EnergyParticles'
import DataOverlay from './pipeline/DataOverlay'
import PipelineChartBars from '../../neural-nexus/canvas/pipeline/PipelineChartBars'
import AmbientParticles from '../../neural-nexus/canvas/environment/AmbientParticles'
import LightingV2 from './environment/LightingV2'
import PostProcessingV2 from './environment/PostProcessingV2'

class R3FErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    console.warn(`[R3F-V2] ${this.props.name} failed:`, err.message)
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

export default function SceneV2() {
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
        {/* Darker background than v1 (#050B14 -> #030712) */}
        <color attach="background" args={['#030712']} />

        <Safe name="LightingV2"><LightingV2 /></Safe>

        {/* All pipeline content shifted left to center in main stage area */}
        <group position={[contentOffsetX, 0, 0]}>
          <Safe name="ChartBars"><PipelineChartBars /></Safe>
          <Safe name="DataOverlay"><DataOverlay /></Safe>
          <Safe name="EnergySplines"><EnergySplines /></Safe>
          <Safe name="EnergyParticles"><EnergyParticles /></Safe>
          <Safe name="HudNodes"><HudNodesGroup /></Safe>
        </group>

        {/* Background atmosphere stays centered on full viewport */}
        <Safe name="AmbientParticles"><AmbientParticles /></Safe>

        <Safe name="PostProcessingV2"><PostProcessingV2 /></Safe>
      </Canvas>
    </div>
  )
}
