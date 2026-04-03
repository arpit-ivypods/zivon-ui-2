import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── helpers ─── */

function srand(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Compute a point ON a ring's torus circle.
 * Ring circle lives in the XY plane at radius R, then rotated by ring's Euler.
 * @param {number} R   — major radius
 * @param {number[]} rot — [rx, ry, rz] Euler angles
 * @param {number} u   — angle around the circle (0..2π)
 * @returns {THREE.Vector3}
 */
function pointOnRing(R, rot, u) {
  const pt = new THREE.Vector3(
    Math.cos(u) * R,
    Math.sin(u) * R,
    0
  )
  const euler = new THREE.Euler(rot[0], rot[1], rot[2], 'XYZ')
  pt.applyEuler(euler)
  return pt
}

/**
 * Generate a SHARP zigzag lightning path with straight segments.
 */
function generateSharpBoltPath(origin, target, segCount, zigzag, seed) {
  const points = [origin.clone()]
  const dir = new THREE.Vector3().subVectors(target, origin)
  const len = dir.length()
  if (len < 0.01) return [origin.clone(), target.clone()]
  dir.normalize()

  const up = Math.abs(dir.y) < 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(1, 0, 0)
  const perp1 = new THREE.Vector3().crossVectors(dir, up).normalize()
  const perp2 = new THREE.Vector3().crossVectors(dir, perp1).normalize()

  let offsetA = 0, offsetB = 0

  for (let i = 1; i <= segCount; i++) {
    const frac = i / segCount
    const basePos = new THREE.Vector3().lerpVectors(origin, target, frac)

    const jumpA = (srand(seed + i * 7.31) - 0.5) * 2 * zigzag
    const jumpB = (srand(seed + i * 13.17) - 0.5) * 2 * zigzag

    const envelope = Math.sin(frac * Math.PI)
    offsetA += jumpA
    offsetB += jumpB
    if (i < segCount) { offsetA *= 0.82; offsetB *= 0.82 }
    else { offsetA = 0; offsetB = 0 } // snap to target at end

    basePos.addScaledVector(perp1, offsetA * envelope)
    basePos.addScaledVector(perp2, offsetB * envelope)
    points.push(basePos)
  }
  return points
}

/**
 * Build tube geometry from straight line segments (sharp corners).
 */
function buildSharpTube(points, radius, radialSegs = 5) {
  if (points.length < 2) return null
  const curvePath = new THREE.CurvePath()
  for (let i = 0; i < points.length - 1; i++) {
    curvePath.add(new THREE.LineCurve3(points[i], points[i + 1]))
  }
  return new THREE.TubeGeometry(curvePath, points.length * 3, radius, radialSegs, false)
}

/* ─── ghost rings ─── */

function GhostRings() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.x = t * 0.5
    ref.current.rotation.z = t * 0.3
  })
  return (
    <group ref={ref}>
      {[0.14, 0.2, 0.28].map((r, i) => (
        <mesh key={i} rotation={[i * 1.2, i * 0.8, i * 0.5]}>
          <torusGeometry args={[r, 0.002, 8, 64]} />
          <meshBasicMaterial
            color="#ffe082" transparent opacity={0.12 - i * 0.02}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ─── single lightning bolt ─── */

function LightningBolt({
  targetPoint,
  tubeRadius = 0.008,
  zigzag = 0.12,
  strikeInterval = 2.5,
  strikeDuration = 0.2,
  phase = 0,
  seed = 0,
  branchConfigs = [],
}) {
  const mainRef = useRef()
  const glowRef = useRef()
  const branchRefs = useRef([])
  const branchGlowRefs = useRef([])
  const lastStrikeRef = useRef(-1)
  const geomsRef = useRef({ main: null, glow: null, branches: [], branchGlows: [] })

  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const target = useMemo(() => targetPoint.clone(), [targetPoint])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    const cycle = (t + phase) % strikeInterval
    const isStriking = cycle < strikeDuration
    const fade = isStriking ? Math.pow(1 - cycle / strikeDuration, 0.4) : 0

    const strikeId = Math.floor((t + phase) / strikeInterval)
    if (strikeId !== lastStrikeRef.current && isStriking) {
      lastStrikeRef.current = strikeId
      const ss = seed + strikeId * 37.91
      const path = generateSharpBoltPath(origin, target, 14, zigzag, ss)
      const g = geomsRef.current

      if (g.main) g.main.dispose()
      if (g.glow) g.glow.dispose()
      g.main = buildSharpTube(path, tubeRadius, 5)
      g.glow = buildSharpTube(path, tubeRadius * 3.5, 5)
      if (mainRef.current && g.main) mainRef.current.geometry = g.main
      if (glowRef.current && g.glow) glowRef.current.geometry = g.glow

      branchConfigs.forEach((bc, bi) => {
        const forkIdx = Math.max(1, Math.floor(bc.forkAt * path.length))
        const forkPt = path[Math.min(forkIdx, path.length - 1)]
        const mainDir = new THREE.Vector3().subVectors(target, origin).normalize()
        const branchPerp = new THREE.Vector3(
          (srand(ss + bi * 99.1) - 0.5) * 2,
          (srand(ss + bi * 77.3) - 0.5) * 2,
          (srand(ss + bi * 55.7) - 0.5) * 2
        ).normalize()
        const branchTarget = new THREE.Vector3()
          .copy(forkPt)
          .addScaledVector(mainDir, bc.length * 0.3)
          .addScaledVector(branchPerp, bc.length * 0.8)
        const branchPath = generateSharpBoltPath(forkPt, branchTarget, 8, zigzag * 0.5, ss + bi * 100)
        if (g.branches[bi]) g.branches[bi].dispose()
        if (g.branchGlows[bi]) g.branchGlows[bi].dispose()
        g.branches[bi] = buildSharpTube(branchPath, tubeRadius * 0.5, 4)
        g.branchGlows[bi] = buildSharpTube(branchPath, tubeRadius * 2, 4)
        if (branchRefs.current[bi] && g.branches[bi]) branchRefs.current[bi].geometry = g.branches[bi]
        if (branchGlowRefs.current[bi] && g.branchGlows[bi]) branchGlowRefs.current[bi].geometry = g.branchGlows[bi]
      })
    }

    const show = fade > 0.01
    if (mainRef.current) { mainRef.current.material.opacity = fade; mainRef.current.visible = show }
    if (glowRef.current) { glowRef.current.material.opacity = fade * 0.4; glowRef.current.visible = show }
    branchRefs.current.forEach((br) => { if (br) { br.material.opacity = fade * 0.85; br.visible = show } })
    branchGlowRefs.current.forEach((bg) => { if (bg) { bg.material.opacity = fade * 0.3; bg.visible = show } })
  })

  const coreMat = { color: new THREE.Color(6, 5, 2), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }
  const glowMat = { color: new THREE.Color(2, 1.5, 0.3), transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }

  return (
    <group>
      <mesh ref={mainRef} visible={false}>
        <bufferGeometry />
        <meshBasicMaterial {...coreMat} />
      </mesh>
      <mesh ref={glowRef} visible={false}>
        <bufferGeometry />
        <meshBasicMaterial {...glowMat} />
      </mesh>
      {branchConfigs.map((_, bi) => (
        <group key={bi}>
          <mesh ref={(el) => (branchRefs.current[bi] = el)} visible={false}>
            <bufferGeometry />
            <meshBasicMaterial {...coreMat} />
          </mesh>
          <mesh ref={(el) => (branchGlowRefs.current[bi] = el)} visible={false}>
            <bufferGeometry />
            <meshBasicMaterial {...glowMat} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ─── lightning system ─── */

function LightningSystem({ ringDefs = [] }) {
  const configs = useMemo(() => {
    const result = []
    // Only 10 bolts total — with long intervals → ~2-3 visible at any time
    const count = 10

    for (let i = 0; i < count; i++) {
      // Pick a random ring
      const ringIdx = Math.floor(srand(i * 23.7) * ringDefs.length)
      const ring = ringDefs[ringIdx]
      if (!ring) continue

      // Pick a random angle ON that ring's torus circle
      const u = srand(i * 41.3) * Math.PI * 2
      const targetPoint = pointOnRing(ring.radius, ring.rotation, u)

      const distFactor = ring.radius / 2.8
      const tubeRadius = (0.005 + srand(i * 17.9) * 0.008) * (0.7 + distFactor * 0.3)

      const branchCount = srand(i * 61.1) > 0.6 ? 1 : 0
      const branchConfigs = Array.from({ length: branchCount }, (_, bi) => ({
        forkAt: 0.3 + srand(i * 77 + bi) * 0.4,
        length: 0.25 + srand(i * 88 + bi) * 0.4,
      }))

      result.push({
        targetPoint,
        tubeRadius,
        zigzag: 0.08 + srand(i * 31.5) * 0.16,
        strikeInterval: 2.0 + srand(i * 53.2) * 3.0, // 2–5 sec between strikes
        strikeDuration: 0.12 + srand(i * 67.8) * 0.18, // visible for 0.12–0.3 sec
        phase: i * 0.7 + srand(i * 19.4) * 2.0, // staggered start
        seed: srand(i * 99.9) * 1000,
        branchConfigs,
      })
    }
    return result
  }, [ringDefs])

  return (
    <group>
      {configs.map((c, i) => (
        <LightningBolt key={i} {...c} />
      ))}
    </group>
  )
}

/* ─── main export ─── */

export default function EnergyCore({ ringDefs = [] }) {
  const coreRef = useRef()
  const innerGlowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.15)
    if (innerGlowRef.current) innerGlowRef.current.scale.setScalar(1 + Math.sin(t * 2.0 + 0.5) * 0.2)
  })

  return (
    <group>
      {/* Singularity — HDR white drives bloom halo */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color={new THREE.Color(8, 8, 7)} toneMapped={false} />
      </mesh>

      {/* Gold transition layer */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[0.19, 32, 32]} />
        <meshBasicMaterial color={new THREE.Color(5, 3.5, 0.9)} toneMapped={false} />
      </mesh>

      {/* Faint additive bloom driver */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial
          color={new THREE.Color(1.0, 0.7, 0.12)}
          transparent opacity={0.08} toneMapped={false}
          depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Core point lights */}
      <pointLight color="#ffa726" intensity={15} distance={8} decay={2} />
      <pointLight color="#fff3e0" intensity={6} distance={12} decay={2} />
      <pointLight color="#ffcc02" intensity={8} distance={5} decay={2} />

      <GhostRings />

      {/* Lightning bolts target actual ring surface points */}
      <LightningSystem ringDefs={ringDefs} />
    </group>
  )
}
