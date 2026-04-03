import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  NODE_COUNT, CONNECTION_DISTANCE, MAX_CONNECTIONS, PULSE_COUNT,
} from './constants'

const _obj = new THREE.Object3D()
const _color = new THREE.Color()

/**
 * Neural constellation: floating luminous orbs connected by
 * geometric vector lines with pulse particles traveling along edges.
 */
export default function NeuralConstellation() {
  const instanceRef = useRef()
  const linesRef = useRef()
  const pulsesRef = useRef()
  const frameCounter = useRef(0)
  const edgesRef = useRef([])

  // ─── Node data ───
  const nodeData = useMemo(() => {
    const nodes = []
    const goldColor = new THREE.Color(4, 2.8, 0.5)
    const violetColor = new THREE.Color(0.8, 0.3, 1.5)

    for (let i = 0; i < NODE_COUNT; i++) {
      // Spread nodes across the full scene, including overlapping the waveform
      const x = (Math.random() - 0.5) * 12
      const y = (Math.random() - 0.5) * 6
      const z = (Math.random() - 0.5) * 6

      const dist = Math.sqrt(x * x + z * z)
      const colorT = Math.min(1, Math.max(0, (dist - 1.5) / 3.5))
      const color = new THREE.Color().lerpColors(goldColor, violetColor, colorT)

      nodes.push({
        baseX: x, baseY: y, baseZ: z,
        orbitRadius: 0.1 + Math.random() * 0.25,
        orbitSpeed: 0.03 + Math.random() * 0.06,
        orbitPhase: Math.random() * Math.PI * 2,
        size: 0.02 + Math.random() * 0.04,
        color,
        // Live position (updated each frame)
        px: x, py: y, pz: z,
      })
    }
    return nodes
  }, [])

  // ─── Pulse data ───
  const pulseData = useMemo(() => {
    return Array.from({ length: PULSE_COUNT }, () => ({
      edgeIdx: -1,
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.7,
    }))
  }, [])

  // Max possible line segments buffer
  const maxEdges = NODE_COUNT * MAX_CONNECTIONS
  const linePositions = useMemo(() => new Float32Array(maxEdges * 6), [])
  const lineColors = useMemo(() => new Float32Array(maxEdges * 6), [])
  const pulsePositions = useMemo(() => new Float32Array(PULSE_COUNT * 3), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!instanceRef.current) return

    // ─── Update node positions ───
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodeData[i]
      const angle = t * n.orbitSpeed + n.orbitPhase
      n.px = n.baseX + Math.cos(angle) * n.orbitRadius
      n.py = n.baseY + Math.sin(angle * 0.7) * n.orbitRadius * 0.5
      n.pz = n.baseZ + Math.sin(angle) * n.orbitRadius

      _obj.position.set(n.px, n.py, n.pz)
      _obj.scale.setScalar(n.size)
      _obj.updateMatrix()
      instanceRef.current.setMatrixAt(i, _obj.matrix)
      instanceRef.current.setColorAt(i, n.color)
    }
    instanceRef.current.instanceMatrix.needsUpdate = true
    if (instanceRef.current.instanceColor) instanceRef.current.instanceColor.needsUpdate = true

    // ─── Recompute connections every 10 frames ───
    frameCounter.current++
    if (frameCounter.current % 10 === 0) {
      const edges = []
      const degree = new Uint8Array(NODE_COUNT)

      // Collect candidate edges sorted by distance
      const candidates = []
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const dx = nodeData[i].px - nodeData[j].px
          const dy = nodeData[i].py - nodeData[j].py
          const dz = nodeData[i].pz - nodeData[j].pz
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < CONNECTION_DISTANCE) {
            candidates.push({ i, j, dist })
          }
        }
      }
      candidates.sort((a, b) => a.dist - b.dist)

      for (const c of candidates) {
        if (degree[c.i] < MAX_CONNECTIONS && degree[c.j] < MAX_CONNECTIONS) {
          edges.push(c)
          degree[c.i]++
          degree[c.j]++
        }
      }
      edgesRef.current = edges
    }

    // ─── Update connection lines ───
    const edges = edgesRef.current
    if (linesRef.current) {
      for (let e = 0; e < maxEdges; e++) {
        const off = e * 6
        if (e < edges.length) {
          const ei = edges[e]
          const a = nodeData[ei.i]
          const b = nodeData[ei.j]
          linePositions[off]     = a.px; linePositions[off + 1] = a.py; linePositions[off + 2] = a.pz
          linePositions[off + 3] = b.px; linePositions[off + 4] = b.py; linePositions[off + 5] = b.pz
          lineColors[off]     = (a.color.r + b.color.r) * 0.5
          lineColors[off + 1] = (a.color.g + b.color.g) * 0.5
          lineColors[off + 2] = (a.color.b + b.color.b) * 0.5
          lineColors[off + 3] = lineColors[off]
          lineColors[off + 4] = lineColors[off + 1]
          lineColors[off + 5] = lineColors[off + 2]
        } else {
          // Zero out unused segments
          linePositions[off] = linePositions[off+1] = linePositions[off+2] = 0
          linePositions[off+3] = linePositions[off+4] = linePositions[off+5] = 0
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true
      linesRef.current.geometry.attributes.color.needsUpdate = true
    }

    // ─── Update pulse particles ───
    if (pulsesRef.current && edges.length > 0) {
      for (let p = 0; p < PULSE_COUNT; p++) {
        const pd = pulseData[p]

        // Assign to an edge if unassigned or finished
        if (pd.edgeIdx < 0 || pd.edgeIdx >= edges.length || pd.t >= 1) {
          pd.edgeIdx = Math.floor(Math.random() * edges.length)
          pd.t = 0
        }

        pd.t += pd.speed * 0.016 // ~60fps delta

        const edge = edges[pd.edgeIdx]
        if (edge) {
          const a = nodeData[edge.i]
          const b = nodeData[edge.j]
          const tt = pd.t
          pulsePositions[p * 3]     = a.px + (b.px - a.px) * tt
          pulsePositions[p * 3 + 1] = a.py + (b.py - a.py) * tt
          pulsePositions[p * 3 + 2] = a.pz + (b.pz - a.pz) * tt
        }
      }
      pulsesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Instanced spheres for nodes */}
      <instancedMesh ref={instanceRef} args={[null, null, NODE_COUNT]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={maxEdges * 2}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={maxEdges * 2}
            array={lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.4}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Pulse particles traveling along connections */}
      <points ref={pulsesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PULSE_COUNT}
            array={pulsePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={new THREE.Color(5, 4, 2)}
          size={0.06}
          transparent
          opacity={0.9}
          toneMapped={false}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
