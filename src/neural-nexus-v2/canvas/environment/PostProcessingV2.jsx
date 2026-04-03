import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

const chromaOffset = new Vector2(0.001, 0.001)

export default function PostProcessingV2() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={2.0}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />
      <ChromaticAberration
        offset={chromaOffset}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={0.025}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  )
}
