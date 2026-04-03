import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { threeColors } from '../../utils/colors'

const OUTER_INNER = 0.55
const OUTER_OUTER = 0.6
const MIDDLE_INNER = 0.4
const MIDDLE_OUTER = 0.45
const CORE_RADIUS = 0.35

export default function EngineNode({ position, name, metric, index }) {
  const outerRingRef = useRef()
  const coreRef = useRef()
  const groupRef = useRef()

  // Rotation direction: odd clockwise, even counter-clockwise
  const rotDir = index % 2 === 0 ? 1 : -1
  // 0.5 RPM = 0.5 * 2PI / 60 = ~0.05236 rad/s
  const rotSpeed = 0.05236

  // Dashed ring segments for outer ring
  const outerRingGeo = useMemo(() => new THREE.RingGeometry(OUTER_INNER, OUTER_OUTER, 64), [])
  const middleRingGeo = useMemo(() => new THREE.RingGeometry(MIDDLE_INNER, MIDDLE_OUTER, 64), [])
  const coreGeo = useMemo(() => new THREE.CircleGeometry(CORE_RADIUS, 64), [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    // Rotate outer ring
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += rotDir * rotSpeed * (1 / 60)
    }
    // Oscillate core opacity
    if (coreRef.current) {
      coreRef.current.material.opacity = 0.5 + 0.2 * Math.sin(time * 1.5)
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3} rotationIntensity={0}>
      <group ref={groupRef} position={position}>
        {/* Outer dashed ring */}
        <mesh ref={outerRingRef} geometry={outerRingGeo}>
          <meshBasicMaterial
            color={threeColors.cyanPrimary}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Middle glow ring */}
        <mesh geometry={middleRingGeo}>
          <meshBasicMaterial
            color={threeColors.cyanPrimary}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Inner core */}
        <mesh ref={coreRef} geometry={coreGeo}>
          <meshBasicMaterial
            color={0x0a142d}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Label text above */}
        <Text
          position={[0, 0.75, 0.01]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          {name}
        </Text>

        {/* Metric text below */}
        <Text
          position={[0, -0.75, 0.01]}
          fontSize={0.08}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          {metric}
        </Text>
      </group>
    </Float>
  )
}
