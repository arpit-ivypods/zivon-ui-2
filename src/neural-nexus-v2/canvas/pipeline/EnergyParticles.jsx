import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SPLINE_COUNT, getSplinePosition } from '../../../neural-nexus/utils/splines'

const MAX_PARTICLES = 20
const TRAIL_LENGTH = 2
const TOTAL_INSTANCES = MAX_PARTICLES * (1 + TRAIL_LENGTH)

const SPEED_CLASSES = [
  { duration: 3.0 },
  { duration: 4.5 },
  { duration: 6.0 },
]

export default function EnergyParticles() {
  const meshRef = useRef()
  const particlesRef = useRef([])
  const spawnTimerRef = useRef(0)
  const dummyObj = useMemo(() => new THREE.Object3D(), [])

  // Small particles — radius 0.015
  const geometry = useMemo(() => new THREE.SphereGeometry(0.015, 6, 6), [])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const particles = particlesRef.current

    // Spawn less frequently, enforce spacing
    spawnTimerRef.current -= delta
    if (spawnTimerRef.current <= 0 && particles.length < MAX_PARTICLES) {
      const splineIdx = Math.floor(Math.random() * SPLINE_COUNT)
      // Ensure minimum spacing: no other particle on same spline within 0.15 of t=0
      const tooClose = particles.some(p => p.splineIndex === splineIdx && p.t < 0.15)
      if (!tooClose) {
        const speedClass = SPEED_CLASSES[Math.floor(Math.random() * SPEED_CLASSES.length)]
        particles.push({
          splineIndex: splineIdx,
          t: 0,
          speed: 1 / speedClass.duration,
        })
      }
      spawnTimerRef.current = 0.8 + Math.random() * 1.5
    }

    // Update particles
    let instanceIdx = 0
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.t += p.speed * delta
      if (p.t >= 1) {
        particles.splice(i, 1)
      }
    }

    // Set instance transforms
    for (let i = 0; i < particles.length && instanceIdx < TOTAL_INSTANCES; i++) {
      const p = particles[i]

      const pos = getSplinePosition(p.splineIndex, p.t, time)
      dummyObj.position.copy(pos)
      dummyObj.scale.setScalar(1)
      dummyObj.updateMatrix()
      meshRef.current.setMatrixAt(instanceIdx, dummyObj.matrix)
      instanceIdx++

      // Faint trail — 2 dots
      for (let tr = 1; tr <= TRAIL_LENGTH && instanceIdx < TOTAL_INSTANCES; tr++) {
        const trailT = p.t - tr * 0.02
        if (trailT < 0) {
          dummyObj.position.set(0, -100, 0)
          dummyObj.scale.setScalar(0)
        } else {
          const trailPos = getSplinePosition(p.splineIndex, trailT, time)
          dummyObj.position.copy(trailPos)
          dummyObj.scale.setScalar(tr === 1 ? 0.6 : 0.3)
        }
        dummyObj.updateMatrix()
        meshRef.current.setMatrixAt(instanceIdx, dummyObj.matrix)
        instanceIdx++
      }
    }

    // Hide remaining
    for (let i = instanceIdx; i < TOTAL_INSTANCES; i++) {
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
        opacity={0.9}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
