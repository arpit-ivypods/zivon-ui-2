import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A single armillary ring with an H-beam / railed cross-section profile.
 * The profile has:  outer lip → recessed channel → inner lip
 * This creates the mechanical, structural look from the reference.
 */
export default function GoldenRing({
  radius = 2,
  rotation = [0, 0, 0],
  speed = 0.3,
  axis = 'y',
  segments = 256,
  profileScale = 1,
  hasJoints = true,
  jointCount = 8,
}) {
  const ref = useRef()

  // H-beam cross-section profile
  const geometry = useMemo(() => {
    const s = profileScale
    const shape = new THREE.Shape()
    // H-beam profile (viewed from cross-section)
    // Outer lip top
    const outerH = 0.06 * s   // total height of outer lips
    const innerH = 0.03 * s   // height of inner recess
    const outerW = 0.035 * s  // width of outer lips
    const innerW = 0.015 * s  // width of inner web
    const channelDepth = 0.01 * s // depth of channel

    // Draw H-beam shape (right half, mirrored)
    shape.moveTo(-outerW, -outerH)
    shape.lineTo(outerW, -outerH)
    shape.lineTo(outerW, -outerH + innerH)
    shape.lineTo(innerW, -outerH + innerH)
    shape.lineTo(innerW, -channelDepth)
    shape.lineTo(outerW, -channelDepth)
    shape.lineTo(outerW, channelDepth)
    shape.lineTo(innerW, channelDepth)
    shape.lineTo(innerW, outerH - innerH)
    shape.lineTo(outerW, outerH - innerH)
    shape.lineTo(outerW, outerH)
    shape.lineTo(-outerW, outerH)
    shape.lineTo(-outerW, outerH - innerH)
    shape.lineTo(-innerW, outerH - innerH)
    shape.lineTo(-innerW, channelDepth)
    shape.lineTo(-outerW, channelDepth)
    shape.lineTo(-outerW, -channelDepth)
    shape.lineTo(-innerW, -channelDepth)
    shape.lineTo(-innerW, -outerH + innerH)
    shape.lineTo(-outerW, -outerH + innerH)
    shape.closePath()

    // Create circular extrude path
    const curvePts = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      curvePts.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        )
      )
    }
    const extrudePath = new THREE.CatmullRomCurve3(curvePts, true)

    const geom = new THREE.ExtrudeGeometry(shape, {
      steps: segments,
      extrudePath,
      bevelEnabled: false,
    })
    geom.computeVertexNormals()
    return geom
  }, [radius, segments, profileScale])

  // Joint/bracket geometry positions
  const joints = useMemo(() => {
    if (!hasJoints) return []
    return Array.from({ length: jointCount }, (_, i) => {
      const angle = (i / jointCount) * Math.PI * 2
      return {
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0,
        ],
        rotation: [0, 0, angle],
      }
    })
  }, [hasJoints, jointCount, radius])

  useFrame((_, delta) => {
    if (!ref.current) return
    const s = speed * delta
    if (axis === 'x') ref.current.rotation.x += s
    else if (axis === 'y') ref.current.rotation.y += s
    else if (axis === 'z') ref.current.rotation.z += s
    else if (axis === 'xy') {
      ref.current.rotation.x += s * 0.7
      ref.current.rotation.y += s
    } else if (axis === 'xz') {
      ref.current.rotation.x += s
      ref.current.rotation.z += s * 0.6
    } else if (axis === 'yz') {
      ref.current.rotation.y += s
      ref.current.rotation.z += s * 0.8
    }
  })

  const goldProps = {
    color: '#c9a227',
    emissive: '#6b4c00',
    emissiveIntensity: 0.6,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 2.5,
    side: THREE.DoubleSide,
  }

  return (
    <group ref={ref} rotation={rotation}>
      {/* Main ring body */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* Structural joints / brackets — small subtle details */}
      {joints.map((joint, i) => (
        <group key={i} position={joint.position} rotation={joint.rotation}>
          <mesh castShadow>
            <boxGeometry args={[
              0.015 * profileScale,
              0.1 * profileScale,
              0.1 * profileScale,
            ]} />
            <meshStandardMaterial {...goldProps} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
