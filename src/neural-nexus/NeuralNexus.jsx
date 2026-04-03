import './styles/global.css'
import Scene from './canvas/Scene'
import DashboardGrid from './overlay/DashboardGrid'

export default function NeuralNexus() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#050B14',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      {/* Layer 0 - 3D Canvas (fills the container) */}
      <Scene />

      {/* Layer 1 - HTML Overlay (absolute on top) */}
      <DashboardGrid />
    </div>
  )
}
