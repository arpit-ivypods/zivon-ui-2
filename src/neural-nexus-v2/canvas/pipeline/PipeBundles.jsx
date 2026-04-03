import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { engineNodes } from '../../../neural-nexus/utils/mockData'

const NODES = engineNodes.map(n => [n.x, n.y, n.z])

// --- Materials (shared, created once) ---
const cyanPipeMat = new THREE.MeshStandardMaterial({
  color: '#0088aa', emissive: '#00E5FF', emissiveIntensity: 0.7,
  metalness: 0.3, roughness: 0.25, side: THREE.FrontSide,
})
const orangePipeMat = new THREE.MeshStandardMaterial({
  color: '#996600', emissive: '#FFB800', emissiveIntensity: 0.6,
  metalness: 0.3, roughness: 0.25, side: THREE.FrontSide,
})
const whitePipeMat = new THREE.MeshStandardMaterial({
  color: '#aaaaaa', emissive: '#FFFFFF', emissiveIntensity: 0.5,
  metalness: 0.5, roughness: 0.2, side: THREE.FrontSide,
})
const cyanGlowMat = new THREE.MeshBasicMaterial({
  color: '#00E5FF', opacity: 0.04, transparent: true,
  blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
})
const orangeGlowMat = new THREE.MeshBasicMaterial({
  color: '#FFB800', opacity: 0.04, transparent: true,
  blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
})

// --- Bundle definitions ---
// throughNodes: indices of nodes this bundle converges into
// arcDir: +1 arcs above non-threaded nodes, -1 arcs below
const BUNDLES = [
  { id: 'A', throughNodes: [0, 2, 4, 6], pipeCount: 4, color: 'cyan', arcAmp: 1.4, arcDir: 1 },
  { id: 'B', throughNodes: [1, 3, 5],    pipeCount: 3, color: 'cyan', arcAmp: 1.2, arcDir: 1 },
  { id: 'C', throughNodes: [0, 3, 6],    pipeCount: 3, color: 'orange', arcAmp: 1.5, arcDir: -1 },
  { id: 'D', throughNodes: [2, 4],       pipeCount: 3, color: 'cyan', arcAmp: 1.0, arcDir: -1 },
  { id: 'E', throughNodes: [1, 5],       pipeCount: 2, color: 'orange', arcAmp: 1.3, arcDir: 1 },
]

// Build a master curve for a bundle: converges at threaded nodes, arcs past others
function buildBundleCenterCurve(bundle, time) {
  const pts = []
  const first = NODES[0]
  const last = NODES[NODES.length - 1]

  // Start off-screen left
  pts.push(new THREE.Vector3(first[0] - 2.0, first[1], 0))

  for (let i = 0; i < NODES.length; i++) {
    const [nx, ny, nz] = NODES[i]
    const isThreaded = bundle.throughNodes.includes(i)

    if (isThreaded) {
      // Converge: approach node, hit center, depart
      if (pts.length > 0) {
        const prev = pts[pts.length - 1]
        const approachX = nx - 0.4
        const approachY = ny + (prev.y > ny ? 0.15 : -0.15)
        pts.push(new THREE.Vector3(approachX, approachY, 0))
      }
      pts.push(new THREE.Vector3(nx, ny, 0)) // AT NODE CENTER
      // Departure point
      if (i < NODES.length - 1) {
        const departX = nx + 0.4
        pts.push(new THREE.Vector3(departX, ny + bundle.arcDir * 0.2, 0))
      }
    } else {
      // Arc past this node
      const wobble = Math.sin(time * 0.2 + i * 1.3) * 0.12
      const arcY = ny + bundle.arcDir * bundle.arcAmp + wobble
      pts.push(new THREE.Vector3(nx, arcY, 0))
    }

    // Midpoint between nodes for smooth arcs
    if (i < NODES.length - 1) {
      const [nx2, ny2] = NODES[i + 1]
      const midX = (nx + nx2) / 2
      const isNextThreaded = bundle.throughNodes.includes(i + 1)
      let midY
      if (isThreaded && isNextThreaded) {
        midY = (ny + ny2) / 2 + bundle.arcDir * bundle.arcAmp * 0.6
      } else if (isThreaded) {
        midY = ny + bundle.arcDir * bundle.arcAmp * 0.8
      } else if (isNextThreaded) {
        midY = ny2 + bundle.arcDir * bundle.arcAmp * 0.5
      } else {
        midY = (ny + ny2) / 2 + bundle.arcDir * bundle.arcAmp * 0.4
      }
      const wobble = Math.sin(time * 0.15 + i * 0.9 + 2.0) * 0.1
      pts.push(new THREE.Vector3(midX, midY + wobble, 0))
    }
  }

  // End off-screen right
  pts.push(new THREE.Vector3(last[0] + 2.0, last[1], 0))

  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
}

// Create an offset curve for individual pipes within a bundle
// Offset is applied perpendicular to the curve direction (locally up/down)
function buildOffsetCurve(masterCurve, yOffset) {
  const sampleCount = 100
  const pts = []
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount
    const p = masterCurve.getPointAt(t)
    // Simple Y offset (perpendicular to the roughly horizontal flow)
    pts.push(new THREE.Vector3(p.x, p.y + yOffset, p.z))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3)
}

// Single pipe mesh that updates its TubeGeometry each frame
function AnimatedPipe({ bundleDef, yOffset, material }) {
  const meshRef = useRef()

  const initCurve = useMemo(() => {
    const master = buildBundleCenterCurve(bundleDef, 0)
    return yOffset === 0 ? master : buildOffsetCurve(master, yOffset)
  }, [bundleDef, yOffset])

  const initGeo = useMemo(
    () => new THREE.TubeGeometry(initCurve, 120, 0.04, 8, false),
    [initCurve]
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const master = buildBundleCenterCurve(bundleDef, time)
    const curve = yOffset === 0 ? master : buildOffsetCurve(master, yOffset)
    const oldGeo = meshRef.current.geometry
    meshRef.current.geometry = new THREE.TubeGeometry(curve, 120, 0.04, 8, false)
    if (oldGeo) oldGeo.dispose()
  })

  return <mesh ref={meshRef} geometry={initGeo} material={material} />
}

// Glow halo tube (faint additive)
function GlowHalo({ bundleDef, material }) {
  const meshRef = useRef()

  const initCurve = useMemo(() => buildBundleCenterCurve(bundleDef, 0), [bundleDef])
  const initGeo = useMemo(
    () => new THREE.TubeGeometry(initCurve, 80, 0.12, 6, false),
    [initCurve]
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const curve = buildBundleCenterCurve(bundleDef, time)
    const oldGeo = meshRef.current.geometry
    meshRef.current.geometry = new THREE.TubeGeometry(curve, 80, 0.12, 6, false)
    if (oldGeo) oldGeo.dispose()
  })

  return <mesh ref={meshRef} geometry={initGeo} material={material} />
}

// One complete bundle: N pipes + glow halo
function PipeBundle({ bundleDef }) {
  const isCyan = bundleDef.color === 'cyan'
  const pipeMat = isCyan ? cyanPipeMat : orangePipeMat
  const glowMat2 = isCyan ? cyanGlowMat : orangeGlowMat

  // Pipe offsets within the bundle
  const offsets = []
  const count = bundleDef.pipeCount
  for (let i = 0; i < count; i++) {
    offsets.push(((i / (count - 1)) - 0.5) * 0.12) // spread from -0.06 to +0.06
  }

  // Middle pipe uses white/silver material
  const midIdx = Math.floor(count / 2)

  return (
    <group>
      {offsets.map((off, i) => (
        <AnimatedPipe
          key={`${bundleDef.id}-pipe-${i}`}
          bundleDef={bundleDef}
          yOffset={off}
          material={i === midIdx ? whitePipeMat : pipeMat}
        />
      ))}
      <GlowHalo bundleDef={bundleDef} material={glowMat2} />
    </group>
  )
}

// Export for particles to use
export function getBundleCenterCurve(bundleIndex, time) {
  const def = BUNDLES[bundleIndex]
  if (!def) return null
  return buildBundleCenterCurve(def, time)
}
export const BUNDLE_COUNT = BUNDLES.length

export default function PipeBundles() {
  return (
    <group>
      {BUNDLES.map((def) => (
        <PipeBundle key={def.id} bundleDef={def} />
      ))}
    </group>
  )
}
