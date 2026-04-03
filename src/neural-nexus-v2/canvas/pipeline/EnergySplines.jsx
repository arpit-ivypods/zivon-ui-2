import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  SPLINE_COUNT,
  generateSplinePoints,
  splineColorPairs,
} from '../../../neural-nexus/utils/splines'

function EnergyTube({ configIndex }) {
  const lineRef = useRef()
  const [colorStart, colorEnd] = splineColorPairs[configIndex]

  const initialPoints = useMemo(
    () => generateSplinePoints(configIndex, 0),
    [configIndex]
  )

  // Per-vertex gradient colors
  const vertexColors = useMemo(() => {
    const c0 = new THREE.Color(colorStart)
    const c1 = new THREE.Color(colorEnd)
    const tmp = new THREE.Color()
    const colors = []
    for (let i = 0; i < initialPoints.length; i++) {
      const t = i / (initialPoints.length - 1)
      tmp.copy(c0).lerp(c1, t)
      colors.push([tmp.r, tmp.g, tmp.b])
    }
    return colors
  }, [initialPoints.length, colorStart, colorEnd])

  useFrame(({ clock }) => {
    if (!lineRef.current) return
    const time = clock.getElapsedTime()
    const points = generateSplinePoints(configIndex, time)
    const positions = []
    for (let i = 0; i < points.length; i++) {
      positions.push(points[i].x, points[i].y, points[i].z)
    }
    const geo = lineRef.current.geometry
    if (geo && geo.setPositions) {
      geo.setPositions(positions)
    }
  })

  return (
    <Line
      ref={lineRef}
      points={initialPoints}
      vertexColors={vertexColors}
      lineWidth={1.5}
      transparent
      opacity={0.7}
      toneMapped={false}
    />
  )
}

export default function EnergySplines() {
  return (
    <group>
      {Array.from({ length: SPLINE_COUNT }, (_, i) => (
        <EnergyTube key={i} configIndex={i} />
      ))}
    </group>
  )
}
