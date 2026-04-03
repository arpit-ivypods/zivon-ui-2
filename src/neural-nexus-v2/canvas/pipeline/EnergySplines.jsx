import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { engineNodes } from '../../../neural-nexus/utils/mockData'

// Node positions for curve threading
const NODES = engineNodes.map(n => ({ x: n.x, y: n.y }))

// Ribbon definitions: which nodes each ribbon threads through, and peak/trough offsets
const RIBBON_DEFS = [
  { // Ribbon 1 cyan: threads through odd nodes (1,3,5,7), arcs above even nodes
    color: '#00E5FF', warmColor: '#00E5FF',
    throughNodes: [0, 2, 4, 6], // indices into NODES array
    peakY: 0.8, troughY: -0.6, zOffset: 0.0,
  },
  { // Ribbon 2 cyan: threads through even nodes (2,4,6), arcs below odd
    color: '#00E5FF', warmColor: '#00C5D8',
    throughNodes: [1, 3, 5],
    peakY: 0.6, troughY: -0.8, zOffset: 0.02,
  },
  { // Ribbon 3 cyan: threads through nodes 1,4,7 — lower path
    color: '#00E5FF', warmColor: '#80E0FF',
    throughNodes: [0, 3, 6],
    peakY: 0.5, troughY: -1.0, zOffset: -0.02,
  },
  { // Ribbon 4 orange: threads through nodes 2,5 — counter-weave
    color: '#FF9100', warmColor: '#FFB800',
    throughNodes: [1, 4],
    peakY: 1.0, troughY: -0.5, zOffset: 0.03,
  },
  { // Ribbon 5 orange: threads through nodes 3,6 — opposite phase
    color: '#FF9100', warmColor: '#FF9100',
    throughNodes: [2, 5],
    peakY: 0.7, troughY: -0.7, zOffset: -0.03,
  },
]

const TUBE_SEGMENTS = 80
const TUBE_RADIAL = 6
const POINTS_PER_CURVE = 100

// Build control points that thread through specified nodes
function buildControlPoints(def, time) {
  const pts = []
  const allX = NODES.map(n => n.x)
  const minX = Math.min(...allX) - 2.0
  const maxX = Math.max(...allX) + 2.0

  // Start off-screen left
  pts.push(new THREE.Vector3(minX, NODES[0].y + def.troughY * 0.3, def.zOffset))

  // For each node, decide if ribbon threads through it or arcs over/under
  for (let i = 0; i < NODES.length; i++) {
    const node = NODES[i]
    const isThreaded = def.throughNodes.includes(i)

    if (isThreaded) {
      // Thread through the node center
      pts.push(new THREE.Vector3(node.x, node.y, def.zOffset))
    } else {
      // Arc above or below — alternate
      const prevThreaded = def.throughNodes.findIndex(t => t > i)
      const aboveOrBelow = (i % 2 === 0) ? def.peakY : def.troughY
      const timeWobble = Math.sin(time * 0.3 + i * 1.2) * 0.15
      pts.push(new THREE.Vector3(node.x, node.y + aboveOrBelow + timeWobble, def.zOffset))
    }

    // Add a midpoint between this node and the next for smoother curves
    if (i < NODES.length - 1) {
      const next = NODES[i + 1]
      const midX = (node.x + next.x) / 2
      const isThisThreaded = isThreaded
      const isNextThreaded = def.throughNodes.includes(i + 1)

      // Midpoint swings opposite to threaded nodes
      let midY
      if (isThisThreaded && isNextThreaded) {
        midY = (node.y + next.y) / 2 + def.peakY * 0.7
      } else if (isThisThreaded) {
        midY = node.y + def.peakY * 0.5
      } else if (isNextThreaded) {
        midY = next.y + def.troughY * 0.5
      } else {
        midY = (node.y + next.y) / 2 + Math.sin(time * 0.2 + i * 0.8) * 0.4
      }

      const timeWobble = Math.sin(time * 0.25 + i * 1.5 + 0.5) * 0.2
      pts.push(new THREE.Vector3(midX, midY + timeWobble, def.zOffset))
    }
  }

  // End off-screen right
  const lastNode = NODES[NODES.length - 1]
  pts.push(new THREE.Vector3(maxX, lastNode.y + def.troughY * 0.3, def.zOffset))

  return pts
}

// Single ribbon with 3-layer volumetric tubes
function VolumetricRibbon({ def, index }) {
  const glowRef = useRef()
  const bodyRef = useRef()
  const coreRef = useRef()

  const color = useMemo(() => new THREE.Color(def.color), [def.color])
  const warmColor = useMemo(() => new THREE.Color(def.warmColor), [def.warmColor])

  // Materials - created once, reused
  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  }), [color])

  const bodyMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: warmColor,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  }), [warmColor])

  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#FFFFFF'),
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }), [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const controlPts = buildControlPoints(def, time)
    const curve = new THREE.CatmullRomCurve3(controlPts, false, 'catmullrom', 0.5)

    // Rebuild tube geometries
    const updateTube = (ref, radius) => {
      if (!ref.current) return
      const oldGeo = ref.current.geometry
      ref.current.geometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, radius, TUBE_RADIAL, false)
      if (oldGeo) oldGeo.dispose()
    }

    updateTube(glowRef, 0.08)
    updateTube(bodyRef, 0.035)
    updateTube(coreRef, 0.01)
  })

  // Initial geometry
  const initPts = useMemo(() => buildControlPoints(def, 0), [def])
  const initCurve = useMemo(() => new THREE.CatmullRomCurve3(initPts, false, 'catmullrom', 0.5), [initPts])
  const initGlowGeo = useMemo(() => new THREE.TubeGeometry(initCurve, TUBE_SEGMENTS, 0.08, TUBE_RADIAL, false), [initCurve])
  const initBodyGeo = useMemo(() => new THREE.TubeGeometry(initCurve, TUBE_SEGMENTS, 0.035, TUBE_RADIAL, false), [initCurve])
  const initCoreGeo = useMemo(() => new THREE.TubeGeometry(initCurve, TUBE_SEGMENTS, 0.01, TUBE_RADIAL, false), [initCurve])

  return (
    <group>
      {/* Layer 1: Outer glow */}
      <mesh ref={glowRef} geometry={initGlowGeo} material={glowMat} />
      {/* Layer 2: Color body */}
      <mesh ref={bodyRef} geometry={initBodyGeo} material={bodyMat} />
      {/* Layer 3: White-hot core */}
      <mesh ref={coreRef} geometry={initCoreGeo} material={coreMat} />
    </group>
  )
}

// Export curve builder for particles to use
export function getRibbonCurve(ribbonIndex, time) {
  const def = RIBBON_DEFS[ribbonIndex]
  if (!def) return null
  const pts = buildControlPoints(def, time)
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

export const RIBBON_COUNT = RIBBON_DEFS.length

export default function EnergySplines() {
  return (
    <group>
      {RIBBON_DEFS.map((def, i) => (
        <VolumetricRibbon key={i} def={def} index={i} />
      ))}
    </group>
  )
}
