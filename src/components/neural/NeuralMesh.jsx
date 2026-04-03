import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _obj = new THREE.Object3D()

function srand(s) {
  const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Neural Mesh — dense volumetric node network filling the background.
 *
 * Bright glowing nodes with radiating connection lines,
 * colored with the purple → gold → cyan gradient based on X position.
 * Nodes pulse, drift slowly, and lines glow with inherited node colors.
 */
export default function NeuralMesh({ speed = 1, nodeCount = 90 }) {
  const instanceRef = useRef()
  const linesRef = useRef()
  const virtualTime = useRef(0)
  const currentSpeed = useRef(speed)
  const frameCount = useRef(0)
  const edgesRef = useRef([])

  const NODE_COUNT = nodeCount
  const MAX_CONN = 4
  const CONN_DIST = 3.5

  // ─── Node generation ───
  const nodeData = useMemo(() => {
    const purpleNode  = new THREE.Color(1.2, 0.4, 2.0)    // HDR purple
    const goldNode    = new THREE.Color(3.5, 2.2, 0.4)    // HDR gold/amber
    const cyanNode    = new THREE.Color(0.4, 1.8, 2.5)    // HDR cyan

    const tmpA = new THREE.Color()
    const tmpB = new THREE.Color()

    return Array.from({ length: NODE_COUNT }, (_, i) => {
      // Spread nodes EVENLY across the full visible background
      // Use a jittered grid approach: divide space into cells, place one node per cell with jitter
      const cols = 10
      const rows = 9
      const col = i % cols
      const row = Math.floor(i / cols) % rows

      // Base grid position covering the full viewport
      const cellW = 18 / cols   // total width 18
      const cellH = 12 / rows   // total height 12
      const baseX = -9 + col * cellW + cellW / 2
      const baseY = -6 + row * cellH + cellH / 2

      // Add random jitter within cell so it doesn't look like a grid
      const x = baseX + (srand(i * 13.7) - 0.5) * cellW * 0.8
      const y = baseY + (srand(i * 27.3) - 0.5) * cellH * 0.8
      const z = (srand(i * 41.9) - 0.5) * 6 - 2   // depth variation, pushed back

      // Color gradient based on X position: purple → gold → cyan
      const t = Math.min(1, Math.max(0, (x + 9) / 18)) // normalize 0..1 across full width
      let color
      if (t <= 0.5) {
        const mixT = t / 0.5
        color = new THREE.Color().lerpColors(
          tmpA.copy(purpleNode),
          tmpB.copy(goldNode),
          mixT
        )
      } else {
        const mixT = (t - 0.5) / 0.5
        color = new THREE.Color().lerpColors(
          tmpA.copy(goldNode),
          tmpB.copy(cyanNode),
          mixT
        )
      }

      // Nodes near center (gold zone) are larger and brighter
      const centerDist = Math.abs(t - 0.5) * 2 // 0=center, 1=edge
      const size = 0.025 + (1 - centerDist) * 0.025 + srand(i * 67.1) * 0.015

      return {
        baseX: x, baseY: y, baseZ: z,
        px: x, py: y, pz: z,
        driftSpeed: 0.06 + srand(i * 53.3) * 0.1,
        driftRadius: 0.4 + srand(i * 71.7) * 0.6,
        driftPhase: srand(i * 89.1) * Math.PI * 2,
        pulseSpeed: 1.5 + srand(i * 33.7) * 4,
        pulsePhase: srand(i * 47.9) * Math.PI * 2,
        size,
        color,
      }
    })
  }, [])

  // ─── Connection line buffers ───
  const maxEdges = NODE_COUNT * MAX_CONN
  const linePositions = useMemo(() => new Float32Array(maxEdges * 6), [])
  const lineColors = useMemo(() => new Float32Array(maxEdges * 6), [])

  useFrame((_, delta) => {
    if (!instanceRef.current) return

    // Smooth speed
    currentSpeed.current += (speed - currentSpeed.current) * Math.min(1, delta * 3)
    virtualTime.current += delta * currentSpeed.current
    const t = virtualTime.current

    // ─── Update node positions + instances ───
    for (let i = 0; i < NODE_COUNT; i++) {
      const n = nodeData[i]
      const angle = t * n.driftSpeed + n.driftPhase

      n.px = n.baseX + Math.cos(angle) * n.driftRadius
      n.py = n.baseY + Math.sin(angle * 0.7) * n.driftRadius * 0.6
      n.pz = n.baseZ + Math.sin(angle * 1.3) * n.driftRadius * 0.4

      // Pulse scale
      const pulse = n.size * (0.7 + 0.5 * Math.sin(t * n.pulseSpeed + n.pulsePhase))

      _obj.position.set(n.px, n.py, n.pz)
      _obj.scale.setScalar(pulse)
      _obj.updateMatrix()
      instanceRef.current.setMatrixAt(i, _obj.matrix)
      instanceRef.current.setColorAt(i, n.color)
    }
    instanceRef.current.instanceMatrix.needsUpdate = true
    if (instanceRef.current.instanceColor)
      instanceRef.current.instanceColor.needsUpdate = true

    // ─── Recompute connections every 8 frames ───
    frameCount.current++
    if (frameCount.current % 8 === 0) {
      const edges = []
      const degree = new Uint8Array(NODE_COUNT)
      const candidates = []

      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const dx = nodeData[i].px - nodeData[j].px
          const dy = nodeData[i].py - nodeData[j].py
          const dz = nodeData[i].pz - nodeData[j].pz
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < CONN_DIST) {
            candidates.push({ i, j, dist })
          }
        }
      }
      candidates.sort((a, b) => a.dist - b.dist)

      for (const c of candidates) {
        if (degree[c.i] < MAX_CONN && degree[c.j] < MAX_CONN) {
          edges.push(c)
          degree[c.i]++
          degree[c.j]++
        }
      }
      edgesRef.current = edges
    }

    // ─── Update connection line positions & colors ───
    const edges = edgesRef.current
    if (linesRef.current) {
      for (let e = 0; e < maxEdges; e++) {
        const off = e * 6
        if (e < edges.length) {
          const a = nodeData[edges[e].i]
          const b = nodeData[edges[e].j]

          linePositions[off]     = a.px
          linePositions[off + 1] = a.py
          linePositions[off + 2] = a.pz
          linePositions[off + 3] = b.px
          linePositions[off + 4] = b.py
          linePositions[off + 5] = b.pz

          // Line color = average of node colors (inherits gradient)
          lineColors[off]     = a.color.r * 0.6
          lineColors[off + 1] = a.color.g * 0.6
          lineColors[off + 2] = a.color.b * 0.6
          lineColors[off + 3] = b.color.r * 0.6
          lineColors[off + 4] = b.color.g * 0.6
          lineColors[off + 5] = b.color.b * 0.6
        } else {
          linePositions[off] = linePositions[off+1] = linePositions[off+2] = 0
          linePositions[off+3] = linePositions[off+4] = linePositions[off+5] = 0
        }
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true
      linesRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Glowing nodes — bright, HDR, drive bloom halos */}
      <instancedMesh ref={instanceRef} args={[null, null, NODE_COUNT]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Connection lines — radiating from nodes */}
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
          opacity={0.3}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}
