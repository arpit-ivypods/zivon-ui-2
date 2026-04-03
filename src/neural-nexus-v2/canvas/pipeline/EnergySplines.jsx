import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  SPLINE_COUNT,
  generateSplinePoints,
  splineColorPairs,
} from '../../../neural-nexus/utils/splines'

// Color mapping for the energy tubes
// Splines 1-2: Cyan core with cyan glow
// Spline 3: White/bright core transitioning cyan to orange
// Splines 4-5: Orange core with orange glow
const SPLINE_CORE_COLORS = [
  '#00E5FF', // cyan
  '#00E5FF', // cyan
  '#FFFFFF', // white/bright transitional core
  '#FF9100', // orange
  '#FF9100', // orange
]

const SPLINE_GLOW_COLORS = [
  '#00E5FF',
  '#00C5D8',
  '#FF9100', // glow on transitional spline leans orange
  '#D97A00',
  '#FF9100',
]

// Three pass configurations for thick glowing tube effect
const PASSES = [
  { lineWidth: 6, opacity: 0.85, colorKey: 'core' },   // Inner bright core
  { lineWidth: 14, opacity: 0.3, colorKey: 'core' },    // Middle glow envelope
  { lineWidth: 24, opacity: 0.1, colorKey: 'glow' },    // Outer soft halo
]

function EnergyTube({ configIndex }) {
  // Refs for each of the 3 passes
  const coreRef = useRef()
  const glowRef = useRef()
  const haloRef = useRef()
  const lineRefs = [coreRef, glowRef, haloRef]

  const coreColor = SPLINE_CORE_COLORS[configIndex]
  const glowColor = SPLINE_GLOW_COLORS[configIndex]

  // Color pairs for gradient vertex coloring
  const [colorStart, colorEnd] = splineColorPairs[configIndex]

  // Generate initial points
  const initialPoints = useMemo(
    () => generateSplinePoints(configIndex, 0),
    [configIndex]
  )

  // Per-vertex colors for core pass (gradient along spline)
  const coreVertexColors = useMemo(() => {
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

  // Per-vertex colors for glow pass
  const glowVertexColors = useMemo(() => {
    const c0 = new THREE.Color(colorStart)
    const c1 = new THREE.Color(glowColor)
    const tmp = new THREE.Color()
    const colors = []
    for (let i = 0; i < initialPoints.length; i++) {
      const t = i / (initialPoints.length - 1)
      tmp.copy(c0).lerp(c1, t)
      colors.push([tmp.r, tmp.g, tmp.b])
    }
    return colors
  }, [initialPoints.length, colorStart, glowColor])

  // Update all three passes every frame
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const points = generateSplinePoints(configIndex, time)
    const positions = []
    for (let i = 0; i < points.length; i++) {
      positions.push(points[i].x, points[i].y, points[i].z)
    }

    // Update each line pass geometry
    for (const ref of lineRefs) {
      if (!ref.current) continue
      const geo = ref.current.geometry
      if (geo && geo.setPositions) {
        geo.setPositions(positions)
      }
    }
  })

  return (
    <group>
      {/* Pass 1: Inner bright energy core */}
      <Line
        ref={coreRef}
        points={initialPoints}
        vertexColors={coreVertexColors}
        lineWidth={PASSES[0].lineWidth}
        transparent
        opacity={PASSES[0].opacity}
        toneMapped={false}
      />

      {/* Pass 2: Middle glow envelope */}
      <Line
        ref={glowRef}
        points={initialPoints}
        vertexColors={glowVertexColors}
        lineWidth={PASSES[1].lineWidth}
        transparent
        opacity={PASSES[1].opacity}
        toneMapped={false}
      />

      {/* Pass 3: Outer soft halo */}
      <Line
        ref={haloRef}
        points={initialPoints}
        vertexColors={glowVertexColors}
        lineWidth={PASSES[2].lineWidth}
        transparent
        opacity={PASSES[2].opacity}
        toneMapped={false}
      />
    </group>
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
