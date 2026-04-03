import NeuralMesh from './NeuralMesh'
import WaveformMesh from './WaveformMesh'
import VoidParticles from './VoidParticles'

/**
 * Scene orchestrator — composes all neural waveform sub-components.
 * NeuralMesh renders BEFORE WaveformMesh so it sits behind visually.
 */
export default function NeuralWaveform({ speed = 1 }) {
  return (
    <group>
      <VoidParticles />
      <NeuralMesh speed={speed} />
      <WaveformMesh speed={speed} />
    </group>
  )
}
