import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getRibbonCurve, RIBBON_COUNT } from './EnergySplines'

const MAX_PARTICLES = 20
const TRAIL_LENGTH = 2
const TOTAL_INSTANCES = MAX_PARTICLES * (1 + TRAIL_LENGTH)

const SPEED_CLASSES = [
  { duration: 4.0 },  // fast
  { duration: 5.5 },  // medium
  { duration: 7.0 },  // slow
]

export default function EnergyParticles() {
  const meshRef = useRef()
  const particlesRef = useRef([])
  const spawnTimerRef = useRef(0)
  const dummyObj = useMemo(() => new THREE.Object3D(), [])

  const geometry = useMemo(() => new THREE.SphereGeometry(0.018, 8, 8), [])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const particles = particlesRef.current

    // Spawn particles along ribbon curves
    spawnTimerRef.current -= delta
    if (spawnTimerRef.current <= 0 && particles.length < MAX_PARTICLES) {
      const ribbonIdx = Math.floor(Math.random() * RIBBON_COUNT)
      // Check minimum spacing on same ribbon
      const tooClose = particles.some(p => p.ribbonIndex === ribbonIdx && p.t < 0.12)
      if (!tooClose) {
        const speedClass = SPEED_CLASSES[Math.floor(Math.random() * SPEED_CLASSES.length)]
        particles.push({
          ribbonIndex: ribbonIdx,
          t: 0,
          speed: 1 / speedClass.duration,
        })
      }
      spawnTimerRef.current = 1.0 + Math.random() * 1.5
    }

    // Update and cull
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].t += particles[i].speed * delta
      if (particles[i].t >= 1) particles.splice(i, 1)
    }

    // Set instance transforms
    let idx = 0
    for (let i = 0; i < particles.length && idx < TOTAL_INSTANCES; i++) {
      const p = particles[i]
      const curve = getRibbonCurve(p.ribbonIndex, time)
      if (!curve) { continue }

      // Lead particle
      try {
        const pos = curve.getPointAt(Math.min(p.t, 0.999))
        dummyObj.position.copy(pos)
        dummyObj.scale.setScalar(1)
        dummyObj.updateMatrix()
        meshRef.current.setMatrixAt(idx, dummyObj.matrix)
        idx++

        // Trail dots
        for (let tr = 1; tr <= TRAIL_LENGTH && idx < TOTAL_INSTANCES; tr++) {
          const trailT = p.t - tr * 0.015
          if (trailT < 0) {
            dummyObj.position.set(0, -100, 0)
            dummyObj.scale.setScalar(0)
          } else {
            const trailPos = curve.getPointAt(Math.min(trailT, 0.999))
            dummyObj.position.copy(trailPos)
            dummyObj.scale.setScalar(tr === 1 ? 0.6 : 0.3)
          }
          dummyObj.updateMatrix()
          meshRef.current.setMatrixAt(idx, dummyObj.matrix)
          idx++
        }
      } catch (e) {
        // Skip if curve sampling fails
        continue
      }
    }

    // Hide remaining
    for (let i = idx; i < TOTAL_INSTANCES; i++) {
      dummyObj.position.set(0, -100, 0)
      dummyObj.scale.setScalar(0)
      dummyObj.updateMatrix()
      meshRef.current.setMatrixAt(i, dummyObj.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, TOTAL_INSTANCES]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color="#FFFFFF"
        transparent
        opacity={0.95}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
