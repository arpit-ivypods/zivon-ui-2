import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WAVE_WIDTH } from './constants'

/**
 * Subtle energy axis — very thin bright line running through the center.
 * Not a thick cylinder — just a hair-thin beam that drives bloom glow.
 */
export default function EnergyAxis() {
  const coreRef = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 3.0) * 0.12
      coreRef.current.scale.set(1, pulse, pulse)
    }
    if (glowRef.current) {
      const p = 1 + Math.sin(t * 2.5 + 0.5) * 0.2
      glowRef.current.scale.set(1, p, p)
      glowRef.current.material.opacity = 0.06 + Math.sin(t * 4) * 0.02
    }
  })

  const beamLength = WAVE_WIDTH + 1

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Hair-thin core beam */}
      <mesh ref={coreRef}>
        <cylinderGeometry args={[0.004, 0.004, beamLength, 6, 1]} />
        <meshBasicMaterial
          color={new THREE.Color(8, 8, 7)}
          toneMapped={false}
        />
      </mesh>

      {/* Very subtle glow halo */}
      <mesh ref={glowRef}>
        <cylinderGeometry args={[0.03, 0.03, beamLength, 6, 1]} />
        <meshBasicMaterial
          color={new THREE.Color(2, 1.8, 1.0)}
          transparent
          opacity={0.06}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
