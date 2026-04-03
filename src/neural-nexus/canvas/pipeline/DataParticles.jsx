import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SPLINE_COUNT, getSplinePosition } from '../../utils/splines'
import { threeColors } from '../../utils/colors'

const MAX_PARTICLES = 200
const TRAIL_LENGTH = 4
const TOTAL_INSTANCES = MAX_PARTICLES * (1 + TRAIL_LENGTH)

const SPEED_CLASSES = [
  { duration: 3.0 },   // fast
  { duration: 4.5 },   // medium
  { duration: 6.0 },   // slow
]

export default function DataParticles() {
  const meshRef = useRef()
  const particlesRef = useRef([])
  const spawnTimerRef = useRef(0)
  const dummyObj = useMemo(() => new THREE.Object3D(), [])
  const tempColor = useMemo(() => new THREE.Color(), [])

  const geometry = useMemo(() => new THREE.SphereGeometry(0.04, 8, 8), [])

  // Color array for per-instance colors
  const colorArray = useMemo(() => new Float32Array(TOTAL_INSTANCES * 3).fill(1), [])

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const particles = particlesRef.current

    // Spawn new particles
    spawnTimerRef.current -= delta
    if (spawnTimerRef.current <= 0 && particles.length < MAX_PARTICLES) {
      const splineIdx = Math.floor(Math.random() * SPLINE_COUNT)
      const speedClass = SPEED_CLASSES[Math.floor(Math.random() * SPEED_CLASSES.length)]
      particles.push({
        splineIndex: splineIdx,
        t: 0,
        speed: 1 / speedClass.duration,
        alive: true,
      })
      spawnTimerRef.current = 0.5 + Math.random() * 1.5
    }

    // Update particles
    let instanceIdx = 0
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.t += p.speed * delta
      if (p.t >= 1) {
        particles.splice(i, 1)
        continue
      }
    }

    // Set instance transforms
    for (let i = 0; i < particles.length && instanceIdx < TOTAL_INSTANCES; i++) {
      const p = particles[i]

      // Main particle
      const pos = getSplinePosition(p.splineIndex, p.t, time)
      dummyObj.position.copy(pos)
      dummyObj.scale.setScalar(1)
      dummyObj.updateMatrix()
      meshRef.current.setMatrixAt(instanceIdx, dummyObj.matrix)

      // Set color to white (bloom will handle glow)
      colorArray[instanceIdx * 3] = 1
      colorArray[instanceIdx * 3 + 1] = 1
      colorArray[instanceIdx * 3 + 2] = 1
      instanceIdx++

      // Trail particles
      for (let tr = 1; tr <= TRAIL_LENGTH && instanceIdx < TOTAL_INSTANCES; tr++) {
        const trailT = p.t - tr * 0.015
        if (trailT < 0) {
          // Hide off-screen
          dummyObj.position.set(0, -100, 0)
          dummyObj.scale.setScalar(0)
          dummyObj.updateMatrix()
          meshRef.current.setMatrixAt(instanceIdx, dummyObj.matrix)
        } else {
          const trailPos = getSplinePosition(p.splineIndex, trailT, time)
          dummyObj.position.copy(trailPos)
          const scl = 1 - tr * 0.2
          dummyObj.scale.setScalar(Math.max(scl, 0.2))
          dummyObj.updateMatrix()
          meshRef.current.setMatrixAt(instanceIdx, dummyObj.matrix)

          const opacity = 1 - tr * 0.2
          colorArray[instanceIdx * 3] = opacity
          colorArray[instanceIdx * 3 + 1] = opacity
          colorArray[instanceIdx * 3 + 2] = opacity
        }
        instanceIdx++
      }
    }

    // Hide remaining instances
    for (let i = instanceIdx; i < TOTAL_INSTANCES; i++) {
      dummyObj.position.set(0, -100, 0)
      dummyObj.scale.setScalar(0)
      dummyObj.updateMatrix()
      meshRef.current.setMatrixAt(i, dummyObj.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true

    // Update instance colors
    const colorAttr = meshRef.current.geometry.getAttribute('color')
    if (colorAttr) {
      colorAttr.array.set(colorArray.subarray(0, TOTAL_INSTANCES * 3))
      colorAttr.needsUpdate = true
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, TOTAL_INSTANCES]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color={threeColors.white}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
