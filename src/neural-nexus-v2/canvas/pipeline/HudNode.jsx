import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import * as THREE from 'three'

// Shared geometries — exactly 2 rings + amber border + core
const outerDashedRingGeo = new THREE.RingGeometry(0.55, 0.565, 64)
const innerSolidRingGeo = new THREE.RingGeometry(0.40, 0.415, 64)
const amberBorderGeo = new THREE.RingGeometry(0.25, 0.265, 64)
const coreDiscGeo = new THREE.CircleGeometry(0.25, 32)

export default function HudNode({ position, name, metric, index, icon }) {
  const outerRef = useRef()
  const innerRef = useRef()

  const outerDir = index % 2 === 0 ? 1 : -1

  useFrame((_, delta) => {
    if (outerRef.current) outerRef.current.rotation.z += outerDir * 0.024 * delta * 60
    if (innerRef.current) innerRef.current.rotation.z -= outerDir * 0.018 * delta * 60
  })

  return (
    <Float speed={1.5} floatIntensity={0.15} rotationIntensity={0}>
      <group position={position}>
        {/* 1. Outer dashed ring — large, thin, faint cyan */}
        <mesh ref={outerRef} geometry={outerDashedRingGeo}>
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 2. Inner solid ring — smaller, thin, slightly brighter */}
        <mesh ref={innerRef} geometry={innerSolidRingGeo}>
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* DARK GAP from 0.265 to 0.40 — void shows through naturally */}

        {/* 3. Amber border ring — subtle warm accent around core */}
        <mesh geometry={amberBorderGeo}>
          <meshBasicMaterial
            color="#FFB800"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* 4. Core disc — dark, nearly opaque */}
        <mesh geometry={coreDiscGeo}>
          <meshBasicMaterial
            color="#0a1628"
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 5. Icon — crisp via Html overlay */}
        <Html
          position={[0, 0, 0.02]}
          center
          style={{
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 0 6px rgba(0, 229, 255, 0.4)',
          }}
        >
          {icon}
        </Html>

        {/* 6. Engine name — Html for crisp text outside bloom */}
        <Html
          position={[0, 0.8, 0]}
          center
          style={{
            color: '#FFFFFF',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px',
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

        {/* 7. Metric */}
        <Html
          position={[0, -0.7, 0]}
          center
          style={{
            color: '#FFFFFF',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            textShadow: '0 0 12px rgba(0, 229, 255, 0.4)',
            pointerEvents: 'none',
          }}
        >
          {metric}
        </Html>

        {/* 8. ACTIVE badge */}
        <Html
          position={[0.45, 0.55, 0]}
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
