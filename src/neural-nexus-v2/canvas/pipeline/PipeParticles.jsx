import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getBundleCenterCurve, BUNDLE_COUNT } from './PipeBundles'

const MAX_PARTICLES = 20
const TRAIL_LENGTH = 2
const TOTAL_INSTANCES = MAX_PARTICLES * (1 + TRAIL_LENGTH)

export default function PipeParticles() {
  const meshRef = useRef()
  const particlesRef = useRef([])
  const spawnTimerRef = useRef(0)
  const dummyObj = useMemo(() => new THREE.Object3D(), [])
  const geometry = useMemo(() => new THREE.SphereGeometry(0.018, 8, 8), [])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const particles = particlesRef.current

    // Spawn
    spawnTimerRef.current -= delta
    if (spawnTimerRef.current <= 0 && particles.length < MAX_PARTICLES) {
      const bundleIdx = Math.floor(Math.random() * BUNDLE_COUNT)
      const tooClose = particles.some(p => p.bundleIdx === bundleIdx && p.t < 0.1)
      if (!tooClose) {
        const speed = 1 / (4 + Math.random() * 3) // 4-7 seconds
        particles.push({ bundleIdx, t: 0, speed })
      }
      spawnTimerRef.current = 1.0 + Math.random() * 1.5
    }

    // Update
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].t += particles[i].speed * delta
      if (particles[i].t >= 1) particles.splice(i, 1)
    }

    // Position instances
    let idx = 0
    for (let i = 0; i < particles.length && idx < TOTAL_INSTANCES; i++) {
      const p = particles[i]
      try {
        const curve = getBundleCenterCurve(p.bundleIdx, time)
        if (!curve) continue

        const pos = curve.getPointAt(Math.min(p.t, 0.999))
        dummyObj.position.copy(pos)
        dummyObj.scale.setScalar(1)
        dummyObj.updateMatrix()
        meshRef.current.setMatrixAt(idx, dummyObj.matrix)
        idx++

        // Trail
        for (let tr = 1; tr <= TRAIL_LENGTH && idx < TOTAL_INSTANCES; tr++) {
          const trailT = p.t - tr * 0.015
          if (trailT < 0) {
            dummyObj.position.set(0, -100, 0)
            dummyObj.scale.setScalar(0)
          } else {
            const tp = curve.getPointAt(Math.min(trailT, 0.999))
            dummyObj.position.copy(tp)
            dummyObj.scale.setScalar(tr === 1 ? 0.6 : 0.3)
          }
          dummyObj.updateMatrix()
          meshRef.current.setMatrixAt(idx, dummyObj.matrix)
          idx++
        }
      } catch { continue }
    }

    // Hide rest
    for (let i = idx; i < TOTAL_INSTANCES; i++) {
      dummyObj.position.set(0, -100, 0)
      dummyObj.scale.setScalar(0)
      dummyObj.updateMatrix()
      meshRef.current.setMatrixAt(i, dummyObj.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, TOTAL_INSTANCES]} frustumCulled={false}>
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.95} toneMapped={false} />
    </instancedMesh>
  )
}
