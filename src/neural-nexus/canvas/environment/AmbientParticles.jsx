import { Sparkles } from '@react-three/drei'

export default function AmbientParticles() {
  return (
    <Sparkles
      count={800}
      scale={[20, 14, 6]}
      size={1.2}
      speed={0.15}
      opacity={0.25}
      color="#ffffff"
    />
  )
}
