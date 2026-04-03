import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

const chromaOffset = new Vector2(0.0005, 0.0005)

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.6}
      />
      <ChromaticAberration
        offset={chromaOffset}
        blendFunction={BlendFunction.NORMAL}
      />
      <Noise
        opacity={0.02}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  )
}
