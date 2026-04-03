import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import * as THREE from 'three'

// Shared geometries
const ring1Geo = new THREE.RingGeometry(0.65, 0.67, 64)   // outermost, largest
const ring2Geo = new THREE.RingGeometry(0.55, 0.57, 64)   // middle
const ring3Geo = new THREE.RingGeometry(0.45, 0.47, 64)   // inner cyan
const orangeRingGeo = new THREE.RingGeometry(0.28, 0.32, 64) // warm inner
const coreGeo = new THREE.CircleGeometry(0.28, 32)
const junctionGlowGeo = new THREE.SphereGeometry(0.12, 16, 16)

// Shared materials
const orangeRingMat = new THREE.MeshStandardMaterial({
  color: '#996600', emissive: '#FFB800', emissiveIntensity: 0.8,
  metalness: 0.4, roughness: 0.3, side: THREE.DoubleSide,
})
const junctionGlowMat = new THREE.MeshBasicMaterial({
  color: '#FFFFFF', opacity: 0.15, transparent: true,
  blending: THREE.AdditiveBlending, depthWrite: false,
})

export default function HudNode({ position, name, metric, index, icon }) {
  const r1Ref = useRef()
  const r2Ref = useRef()
  const r3Ref = useRef()
  const orangeRef = useRef()

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    if (r1Ref.current) r1Ref.current.rotation.z += 0.024 * delta * 60
    if (r2Ref.current) r2Ref.current.rotation.z -= 0.018 * delta * 60
    if (r3Ref.current) r3Ref.current.rotation.z += 0.030 * delta * 60
    // Orange ring pulse
    if (orangeRef.current) {
      orangeRef.current.material.emissiveIntensity = 0.6 + 0.3 * Math.sin(t * 2.0 + index)
    }
  })

  return (
    <Float speed={1.5} floatIntensity={0.12} rotationIntensity={0}>
      <group position={position}>
        {/* Ring 1 — outermost, faintest, stacked forward */}
        <mesh ref={r1Ref} geometry={ring1Geo} position={[0, 0, 0.04]}>
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.2} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        {/* Ring 2 — middle, brighter */}
        <mesh ref={r2Ref} geometry={ring2Geo} position={[0, 0, 0.02]}>
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.35} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        {/* Ring 3 — innermost cyan, brightest */}
        <mesh ref={r3Ref} geometry={ring3Geo} position={[0, 0, 0]}>
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.45} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        {/* DARK GAP: 0.32 to 0.45 — void shows through */}

        {/* Orange inner ring — warm amber hub accent */}
        <mesh ref={orangeRef} geometry={orangeRingGeo} material={orangeRingMat} />

        {/* Dark core fill */}
        <mesh geometry={coreGeo}>
          <meshBasicMaterial color="#0a1628" transparent opacity={0.92} />
        </mesh>

        {/* Junction glow sphere — bright spot where pipes converge */}
        <mesh geometry={junctionGlowGeo} material={junctionGlowMat} />

        {/* Icon */}
        <Html position={[0, 0, 0.05]} center style={{
          color: '#FFFFFF', fontSize: '14px',
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          pointerEvents: 'none', userSelect: 'none',
          textShadow: '0 0 6px rgba(0, 229, 255, 0.4)',
        }}>
          {icon}
        </Html>

        {/* Engine name */}
        <Html position={[0, 0.85, 0]} center style={{
          color: '#FFFFFF',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 600,
          letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap',
          textShadow: '0 0 10px rgba(0, 229, 255, 0.5)', pointerEvents: 'none',
        }}>
          {name}
        </Html>

        {/* Metric */}
        <Html position={[0, -0.75, 0]} center style={{
          color: '#FFFFFF',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700,
          textShadow: '0 0 12px rgba(0, 229, 255, 0.4)', pointerEvents: 'none',
        }}>
          {metric}
        </Html>

        {/* ACTIVE badge */}
        <Html position={[0.5, 0.55, 0]} style={{
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
