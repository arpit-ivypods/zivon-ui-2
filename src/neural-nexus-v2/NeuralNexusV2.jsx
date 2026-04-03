import '../neural-nexus/styles/global.css'
import SceneV2 from './canvas/SceneV2'
// Reuse overlay from v1
import DashboardGrid from '../neural-nexus/overlay/DashboardGrid'

export default function NeuralNexusV2() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: '#030712',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      <SceneV2 />
      <DashboardGrid />
    </div>
  )
}
