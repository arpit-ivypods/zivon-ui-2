import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { VOID_PARTICLE_COUNT } from './constants'

/**
 * Background micro-particles drifting through the deep-space void.
 * Very dim, slow-moving, blue-white dust.
 */
export default function VoidParticles() {
  const ref = useRef()

  const data = useMemo(() => {
    const count = VOID_PARTICLE_COUNT
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const meta = []

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 3 + Math.random() * 9

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      // Dim blue-white with random brightness
      const brightness = 0.3 + Math.random() * 0.7
      colors[i * 3]     = 0.5 * brightness
      colors[i * 3 + 1] = 0.55 * brightness
      colors[i * 3 + 2] = 0.7 * brightness

      meta.push({
        theta, phi, baseR: r,
        speed: 0.01 + Math.random() * 0.04,
        drift: 0.1 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      })
    }
    return { positions, colors, meta, count }
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const pos = ref.current.geometry.attributes.position

    for (let i = 0; i < data.count; i++) {
      const m = data.meta[i]
      const wave = Math.sin(t * m.speed + m.offset) * m.drift
      const r = m.baseR + wave
      const theta = m.theta + t * m.speed * 0.15
      const phi = m.phi + Math.sin(t * 0.08 + m.offset) * 0.05

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
          count={data.count}
          array={data.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={data.count}
          array={data.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        transparent
        opacity={0.4}
        toneMapped={false}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
