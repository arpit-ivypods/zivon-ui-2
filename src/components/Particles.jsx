import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Stardust / spark particles concentrated around the core,
 * with varying size, opacity, and turbulent motion.
 */
export default function Particles({ count = 500 }) {
  const ref = useRef()

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    const meta = []

    const colorA = new THREE.Color('#ffe082')
    const colorB = new THREE.Color('#ffb300')
    const colorC = new THREE.Color('#ffffff')

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      // Concentration: more particles near center (inverse-square falloff)
      const u = Math.random()
      const r = 0.15 + Math.pow(u, 0.5) * 2.8

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Size varies — smaller near core (sparks), larger far (stardust)
      sizes[i] = r < 0.8
        ? 0.005 + Math.random() * 0.012
        : 0.008 + Math.random() * 0.025

      // Color — brighter near core
      const mixColor = r < 0.5 ? colorC : (r < 1.2 ? colorA : colorB)
      colors[i * 3]     = mixColor.r
      colors[i * 3 + 1] = mixColor.g
      colors[i * 3 + 2] = mixColor.b

      meta.push({
        theta,
        phi,
        baseR: r,
        speed: 0.08 + Math.random() * 0.25,
        drift: 0.15 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
        twinkleSpeed: 2 + Math.random() * 5,
      })
    }

    return { positions, sizes, colors, meta }
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const pos = ref.current.geometry.attributes.position

    for (let i = 0; i < count; i++) {
      const m = data.meta[i]
      const wave = Math.sin(t * m.speed + m.offset) * m.drift
      const r = m.baseR + wave
      const theta = m.theta + t * m.speed * 0.2
      const phi = m.phi + Math.sin(t * 0.15 + m.offset) * 0.08

      pos.array[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos.array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos.array[i * 3 + 2] = r * Math.cos(phi)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={data.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={data.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        transparent
        opacity={0.7}
        toneMapped={false}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
