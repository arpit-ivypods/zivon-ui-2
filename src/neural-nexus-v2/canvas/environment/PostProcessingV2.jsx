import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function PostProcessingV2() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.5}
        mipmapBlur
        radius={0.3}
      />
      <Vignette offset={0.3} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  )
}
