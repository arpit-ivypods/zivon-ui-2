import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { engineNodes } from '../../../neural-nexus/utils/mockData'

const NODES = engineNodes.map(n => ({ x: n.x, y: n.y }))

// --- Materials ---
const cyanPipeMat = new THREE.MeshStandardMaterial({
  color: '#0088aa', emissive: '#00E5FF', emissiveIntensity: 0.7,
  metalness: 0.3, roughness: 0.25,
})
const orangePipeMat = new THREE.MeshStandardMaterial({
  color: '#996600', emissive: '#FFB800', emissiveIntensity: 0.6,
  metalness: 0.3, roughness: 0.25,
})
const whitePipeMat = new THREE.MeshStandardMaterial({
  color: '#aaaaaa', emissive: '#FFFFFF', emissiveIntensity: 0.5,
  metalness: 0.5, roughness: 0.2,
})
const cyanGlowMat = new THREE.MeshBasicMaterial({
  color: '#00E5FF', opacity: 0.04, transparent: true,
  blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
})
const orangeGlowMat = new THREE.MeshBasicMaterial({
  color: '#FFB800', opacity: 0.04, transparent: true,
  blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
})

/*
 * PIPE PATH STRATEGY: PLUMBING, NOT WAVES
 *
 * Each bundle connects a sequence of nodes with smooth S-curve transitions.
 * Between two nodes, the pipe:
 *   1. Exits the source node HORIZONTALLY
 *   2. Makes a gentle S-curve to reach the next node's height
 *   3. Enters the destination node HORIZONTALLY
 *
 * The vertical displacement is ONLY the difference in node Y positions.
 * No wild oscillation. No arcing above/below. Just smooth plumbing.
 */

function buildPipePath(nodeSequence, yBias, time) {
  const pts = []
  const nodes = nodeSequence.map(i => NODES[i])

  // Start: extend left from first node, horizontal
  const first = nodes[0]
  pts.push(new THREE.Vector3(first.x - 2.5, first.y + yBias, 0))
  pts.push(new THREE.Vector3(first.x - 1.0, first.y + yBias, 0))

  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i]

    // AT the node center
    pts.push(new THREE.Vector3(curr.x, curr.y + yBias, 0))

    if (i < nodes.length - 1) {
      const next = nodes[i + 1]
      const dx = next.x - curr.x
      const dy = (next.y + yBias) - (curr.y + yBias)

      // S-curve: exit horizontal, transition height in middle third, enter horizontal
      // 4 control points between nodes for smooth S-curve
      const exitX = curr.x + dx * 0.25
      const midX1 = curr.x + dx * 0.4
      const midX2 = curr.x + dx * 0.6
      const enterX = curr.x + dx * 0.75

      // Gentle time-based wobble (very subtle, like cable sway)
      const wobble = Math.sin(time * 0.3 + i * 1.5) * 0.08

      pts.push(new THREE.Vector3(exitX, curr.y + yBias + wobble, 0))        // exit horizontally
      pts.push(new THREE.Vector3(midX1, curr.y + yBias + dy * 0.3 + wobble, 0))  // start transitioning height
      pts.push(new THREE.Vector3(midX2, next.y + yBias - dy * 0.3 + wobble, 0))  // approaching next height
      pts.push(new THREE.Vector3(enterX, next.y + yBias + wobble, 0))       // enter horizontally
    }
  }

  // End: extend right from last node, horizontal
  const last = nodes[nodes.length - 1]
  pts.push(new THREE.Vector3(last.x + 1.0, last.y + yBias, 0))
  pts.push(new THREE.Vector3(last.x + 2.5, last.y + yBias, 0))

  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3)
}

/*
 * Bundle definitions
 * Each bundle follows a specific sequence of nodes (like plumbing routing)
 * yBias offsets the entire bundle slightly up/down from node centers
 */
const BUNDLES = [
  { id: 'A', nodeSeq: [0, 1, 2, 3, 4, 5, 6], pipeCount: 4, color: 'cyan', yBias: 0.15 },
  { id: 'B', nodeSeq: [0, 1, 2, 3, 4, 5, 6], pipeCount: 3, color: 'cyan', yBias: -0.1 },
  { id: 'C', nodeSeq: [0, 2, 4, 6],           pipeCount: 3, color: 'orange', yBias: 0.0 },
  { id: 'D', nodeSeq: [1, 3, 5],              pipeCount: 2, color: 'orange', yBias: -0.2 },
]

// Individual pipe within a bundle — offset perpendicular to flow direction
function AnimatedPipe({ bundleDef, pipeOffset, material }) {
  const meshRef = useRef()

  const initCurve = useMemo(() => {
    const masterCurve = buildPipePath(bundleDef.nodeSeq, bundleDef.yBias, 0)
    return offsetCurve(masterCurve, pipeOffset)
  }, [bundleDef, pipeOffset])

  const initGeo = useMemo(
    () => new THREE.TubeGeometry(initCurve, 120, 0.035, 8, false),
    [initCurve]
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const master = buildPipePath(bundleDef.nodeSeq, bundleDef.yBias, time)
    const curve = offsetCurve(master, pipeOffset)
    const old = meshRef.current.geometry
    meshRef.current.geometry = new THREE.TubeGeometry(curve, 120, 0.035, 8, false)
    if (old) old.dispose()
  })

  return <mesh ref={meshRef} geometry={initGeo} material={material} />
}

// Offset a curve by a small Y amount (perpendicular to mostly-horizontal flow)
function offsetCurve(masterCurve, yOff) {
  if (Math.abs(yOff) < 0.001) return masterCurve
  const n = 80
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const p = masterCurve.getPointAt(t)
    pts.push(new THREE.Vector3(p.x, p.y + yOff, p.z))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3)
}

// Glow halo around the bundle center
function GlowHalo({ bundleDef, material }) {
  const meshRef = useRef()
  const initCurve = useMemo(() => buildPipePath(bundleDef.nodeSeq, bundleDef.yBias, 0), [bundleDef])
  const initGeo = useMemo(() => new THREE.TubeGeometry(initCurve, 80, 0.10, 6, false), [initCurve])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const curve = buildPipePath(bundleDef.nodeSeq, bundleDef.yBias, clock.getElapsedTime())
    const old = meshRef.current.geometry
    meshRef.current.geometry = new THREE.TubeGeometry(curve, 80, 0.10, 6, false)
    if (old) old.dispose()
  })

  return <mesh ref={meshRef} geometry={initGeo} material={material} />
}

function PipeBundle({ bundleDef }) {
  const isCyan = bundleDef.color === 'cyan'
  const pipeMat = isCyan ? cyanPipeMat : orangePipeMat
  const glowMat = isCyan ? cyanGlowMat : orangeGlowMat
  const count = bundleDef.pipeCount

  // Pipe offsets: spread pipes within a tight band (~0.06 total spread)
  const offsets = []
  for (let i = 0; i < count; i++) {
    offsets.push(((i / Math.max(count - 1, 1)) - 0.5) * 0.06)
  }
  const midIdx = Math.floor(count / 2)

  return (
    <group>
      {offsets.map((off, i) => (
        <AnimatedPipe
          key={`${bundleDef.id}-${i}`}
          bundleDef={bundleDef}
          pipeOffset={off}
          material={i === midIdx ? whitePipeMat : pipeMat}
        />
      ))}
      <GlowHalo bundleDef={bundleDef} material={glowMat} />
    </group>
  )
}

// Export center curve for particles
export function getBundleCenterCurve(bundleIndex, time) {
  const def = BUNDLES[bundleIndex]
  if (!def) return null
  return buildPipePath(def.nodeSeq, def.yBias, time)
}
export const BUNDLE_COUNT = BUNDLES.length

export default function PipeBundles() {
  return (
    <group>
      {BUNDLES.map(def => <PipeBundle key={def.id} bundleDef={def} />)}
    </group>
  )
}
