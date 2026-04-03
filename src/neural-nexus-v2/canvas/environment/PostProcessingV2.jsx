import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function PostProcessingV2() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.2}
      />
      {/* Chromatic Aberration REMOVED - causes fringing, not cinematic */}
      <Noise
        opacity={0.02}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  )
}
