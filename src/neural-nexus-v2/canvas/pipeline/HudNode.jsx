import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import * as THREE from 'three'

// Shared geometries
const outerRingGeo = new THREE.RingGeometry(0.55, 0.57, 64)
const middleRingGeo = new THREE.RingGeometry(0.42, 0.44, 64)
const coreDiscGeo = new THREE.CircleGeometry(0.35, 32)

export default function HudNode({ position, name, metric, index, icon }) {
  const outerRingRef = useRef()
  const middleRingRef = useRef()
  const coreRef = useRef()

  const outerDir = index % 2 === 0 ? 1 : -1

  useFrame(({ clock }, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += outerDir * 0.08 * delta
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.z -= outerDir * 0.12 * delta
    }
    if (coreRef.current) {
      const t = clock.getElapsedTime()
      coreRef.current.material.opacity = 0.7 + 0.15 * Math.sin(t * 1.5 + index)
    }
  })

  return (
    <Float speed={1.5} floatIntensity={0.2} rotationIntensity={0}>
      <group position={position}>
        {/* 1. Outer ring - thin, faint cyan */}
        <mesh ref={outerRingRef} geometry={outerRingGeo}>
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 2. Middle accent ring - very faint cyan */}
        <mesh ref={middleRingRef} geometry={middleRingGeo}>
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 3. Inner core - dark translucent */}
        <mesh ref={coreRef} geometry={coreDiscGeo}>
          <meshBasicMaterial
            color="#0a142d"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 4. Icon inside core - via Html for crisp rendering */}
        <Html
          position={[0, 0, 0.02]}
          center
          style={{
            color: '#00E5FF',
            fontSize: '16px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 0 8px rgba(0, 229, 255, 0.5)',
          }}
        >
          {icon}
        </Html>

        {/* 5. Engine name label - Html for crisp text outside bloom */}
        <Html
          position={[0, 0.8, 0]}
          center
          style={{
            color: '#FFFFFF',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            textShadow: '0 0 10px rgba(0, 229, 255, 0.5)',
            pointerEvents: 'none',
          }}
        >
          {name}
        </Html>

        {/* 6. Metric label below */}
        <Html
          position={[0, -0.75, 0]}
          center
          style={{
            color: '#00E5FF',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            textShadow: '0 0 8px rgba(0, 229, 255, 0.3)',
            pointerEvents: 'none',
          }}
        >
          {metric}
        </Html>

        {/* 7. ACTIVE badge */}
        <Html
          position={[0.5, 0.55, 0]}
          style={{
            background: 'rgba(0, 230, 118, 0.15)',
            border: '1px solid #00E676',
            color: '#00E676',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '7px',
            fontWeight: 700,
            letterSpacing: '1px',
            padding: '1px 5px',
            borderRadius: '3px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          ACTIVE
        </Html>
      </group>
    </Float>
  )
}
