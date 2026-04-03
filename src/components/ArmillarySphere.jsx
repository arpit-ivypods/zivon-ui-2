import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import GoldenRing from './GoldenRing'
import EnergyCore from './EnergyCore'
import Particles from './Particles'

/**
 * Ring definitions — shared between the ring meshes and the lightning system
 * so bolts always target actual ring surface points.
 */
const RING_DEFS = [
  { radius: 2.2, rotation: [Math.PI / 2 - 0.6, -0.4, 0.2], speed: 0.1,   axis: 'z', profileScale: 1.0,  hasJoints: true,  jointCount: 8 },
  { radius: 1.7, rotation: [0.4, 0.2, 0],                   speed: -0.13, axis: 'y', profileScale: 0.9,  hasJoints: true,  jointCount: 6 },
  { radius: 1.2, rotation: [1.2, -0.5, 0.8],                speed: 0.16,  axis: 'y', profileScale: 0.75, hasJoints: false },
]

export default function ArmillarySphere() {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.025
    }
  })

  return (
    <group ref={groupRef}>
      {RING_DEFS.map((ring, i) => (
        <GoldenRing key={i} {...ring} />
      ))}

      {/* Pass ring definitions so lightning targets ring surface points */}
      <EnergyCore ringDefs={RING_DEFS} />
      <Particles count={400} />
    </group>
  )
}
