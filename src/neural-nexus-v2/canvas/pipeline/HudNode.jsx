import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'

// Shared geometries - created once, reused across all nodes
const outerRingGeo = new THREE.RingGeometry(0.65, 0.7, 64)
const middleRingGeo = new THREE.RingGeometry(0.5, 0.55, 64)
const innerRingGeo = new THREE.RingGeometry(0.35, 0.42, 64)
const coreDiscGeo = new THREE.CircleGeometry(0.32, 32)
const glowSphereGeo = new THREE.SphereGeometry(0.05, 12, 12)

export default function HudNode({ position, name, metric, index, icon }) {
  const outerRingRef = useRef()
  const middleRingRef = useRef()
  const innerRingRef = useRef()
  const glowSphereRef = useRef()

  // Rotation directions: alternate per node, inner same as outer
  const outerDir = index % 2 === 0 ? 1 : -1
  const middleDir = -outerDir // counter-rotates
  const innerDir = outerDir   // same as outer

  // Rotation speeds (radians per second)
  const outerSpeed = 0.08
  const middleSpeed = 0.12
  const innerSpeed = 0.06

  // Determine icon color: frontend gets cyan, rest get orange/gold
  const isFrontend = name.toLowerCase().includes('frontend')
  const iconColor = isFrontend ? '#00E5FF' : '#FF9100'

  useFrame(({ clock }, delta) => {
    // Rotate outer tech ring
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += outerDir * outerSpeed * delta
    }
    // Counter-rotate middle detail ring
    if (middleRingRef.current) {
      middleRingRef.current.rotation.z += middleDir * middleSpeed * delta
    }
    // Rotate inner glow ring
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += innerDir * innerSpeed * delta
    }
    // Pulse the center glow sphere
    if (glowSphereRef.current) {
      const time = clock.getElapsedTime()
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.5 + index * 0.7)
      glowSphereRef.current.material.opacity = 0.3 + 0.7 * pulse
      const s = 0.8 + 0.4 * pulse
      glowSphereRef.current.scale.setScalar(s)
    }
  })

  return (
    <Float speed={1.5} floatIntensity={0.25} rotationIntensity={0}>
      <group position={position}>
        {/* 1. Outer tech ring - dashed look, cyan, slow rotate */}
        <mesh ref={outerRingRef} geometry={outerRingGeo}>
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 2. Middle detail ring - brighter cyan, counter-rotate */}
        <mesh ref={middleRingRef} geometry={middleRingGeo}>
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 3. Inner glow ring - orange/gold accent */}
        <mesh ref={innerRingRef} geometry={innerRingGeo}>
          <meshBasicMaterial
            color="#FF9100"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 4. Core disc - dark translucent fill */}
        <mesh geometry={coreDiscGeo}>
          <meshBasicMaterial
            color="#060d1f"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 5. Icon symbol inside core */}
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.18}
          color={iconColor}
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          {icon}
        </Text>

        {/* 6. Pulsing glow point at center */}
        <mesh ref={glowSphereRef} geometry={glowSphereGeo}>
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>

        {/* 7. Label text above */}
        <Text
          position={[0, 0.82, 0.01]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          {name}
        </Text>

        {/* 8. Metric text below */}
        <Text
          position={[0, -0.82, 0.01]}
          fontSize={0.09}
          color="#00E5FF"
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          {metric}
        </Text>

        {/* 9. ACTIVE badge - small green text */}
        <Text
          position={[0.55, 0.6, 0.01]}
          fontSize={0.06}
          color="#00E676"
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
        >
          ACTIVE
        </Text>
      </group>
    </Float>
  )
}
