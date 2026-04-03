import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import * as THREE from 'three'

// Compact node geometry — reference shows small, clean hubs
const outerRingGeo = new THREE.RingGeometry(0.38, 0.40, 64)   // thin outer cyan
const innerRingGeo = new THREE.RingGeometry(0.22, 0.26, 64)   // orange/amber accent
const coreGeo = new THREE.CircleGeometry(0.22, 32)             // dark core

const orangeRingMat = new THREE.MeshStandardMaterial({
  color: '#996600', emissive: '#FFB800', emissiveIntensity: 0.8,
  metalness: 0.4, roughness: 0.3, side: THREE.DoubleSide,
})

export default function HudNode({ position, name, metric, index, icon }) {
  const outerRef = useRef()
  const dir = index % 2 === 0 ? 1 : -1

  useFrame((_, delta) => {
    if (outerRef.current) outerRef.current.rotation.z += dir * 0.3 * delta
  })

  return (
    <Float speed={1.5} floatIntensity={0.08} rotationIntensity={0}>
      <group position={position}>
        {/* Outer cyan ring — thin, subtle */}
        <mesh ref={outerRef} geometry={outerRingGeo}>
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.35} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        {/* Orange inner ring */}
        <mesh geometry={innerRingGeo} material={orangeRingMat} />

        {/* Dark core */}
        <mesh geometry={coreGeo}>
          <meshBasicMaterial color="#0a1628" transparent opacity={0.92} />
        </mesh>

        {/* Icon */}
        <Html position={[0, 0, 0.02]} center style={{
          color: '#FFFFFF', fontSize: '13px',
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          pointerEvents: 'none', userSelect: 'none',
          textShadow: '0 0 6px rgba(0, 229, 255, 0.4)',
        }}>
          {icon}
        </Html>

        {/* Engine name */}
        <Html position={[0, 0.6, 0]} center style={{
          color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          textShadow: '0 0 8px rgba(0, 229, 255, 0.5)', pointerEvents: 'none',
        }}>
          {name}
        </Html>

        {/* Metric */}
        <Html position={[0, -0.55, 0]} center style={{
          color: '#FFFFFF', fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '15px', fontWeight: 700,
          textShadow: '0 0 10px rgba(0, 229, 255, 0.4)', pointerEvents: 'none',
        }}>
          {metric}
        </Html>

        {/* ACTIVE badge */}
        <Html position={[0.4, 0.4, 0]} style={{
          background: 'rgba(0, 230, 118, 0.15)', border: '1px solid #00E676',
          color: '#00E676', fontFamily: "'JetBrains Mono', monospace",
          fontSize: '7px', fontWeight: 700, letterSpacing: '1px',
          padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase',
          pointerEvents: 'none',
        }}>
          ACTIVE
        </Html>
      </group>
    </Float>
  )
}
