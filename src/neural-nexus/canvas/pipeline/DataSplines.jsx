import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  SPLINE_COUNT,
  generateSplinePoints,
  splineColorPairs,
} from '../../utils/splines'

function SplineCurve({ configIndex }) {
  const lineRef = useRef()
  const [colorStart, colorEnd] = splineColorPairs[configIndex]
  const c0 = useMemo(() => new THREE.Color(colorStart), [colorStart])
  const c1 = useMemo(() => new THREE.Color(colorEnd), [colorEnd])

  // Initial points
  const initialPoints = useMemo(() => generateSplinePoints(configIndex, 0), [configIndex])

  // Generate per-vertex colors for gradient
  const vertexColors = useMemo(() => {
    const colors = []
    const tmp = new THREE.Color()
    for (let i = 0; i < initialPoints.length; i++) {
      const t = i / (initialPoints.length - 1)
      tmp.copy(c0).lerp(c1, t)
      colors.push([tmp.r, tmp.g, tmp.b])
    }
    return colors
  }, [initialPoints.length, c0, c1])

  useFrame(({ clock }) => {
    if (!lineRef.current) return
    const time = clock.getElapsedTime()
    const points = generateSplinePoints(configIndex, time)
    // Update the line geometry positions
    const geo = lineRef.current.geometry
    const posAttr = geo.getAttribute('instanceStart') || geo.getAttribute('position')
    if (posAttr) {
      // Line2 from drei uses LineGeometry which stores segments differently
      // We need to update via setPositions on the geometry
      const positions = []
      for (let i = 0; i < points.length; i++) {
        positions.push(points[i].x, points[i].y, points[i].z)
      }
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
      opacity={0.6}
      toneMapped={false}
    />
  )
}

export default function DataSplines() {
  return (
    <group>
      {Array.from({ length: SPLINE_COUNT }, (_, i) => (
        <SplineCurve key={i} configIndex={i} />
      ))}
    </group>
  )
}
