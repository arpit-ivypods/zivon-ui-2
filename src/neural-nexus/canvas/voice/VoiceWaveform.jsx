import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import useDashboardStore from '../../store/useDashboardStore'

const WIDTH_SEGS = 50
const HEIGHT_SEGS = 20
const PLANE_WIDTH = 2.5
const PLANE_HEIGHT = 1.2

// Color constants
const colorCyan = new THREE.Color('#00E5FF')
const colorPurple = new THREE.Color('#9D4EDD')
const colorOrange = new THREE.Color('#FF9100')

export default function VoiceWaveform() {
  const meshRef = useRef()
  const noise3D = useMemo(() => createNoise3D(), [])

  // Store selector - we read voiceAmplitude reactively but use it in useFrame via ref
  const amplitudeRef = useRef(0.4)

  useEffect(() => {
    const unsub = useDashboardStore.subscribe(
      (state) => {
        amplitudeRef.current = state.voiceAmplitude
      }
    )
    return unsub
  }, [])

  // Pre-allocate color attribute
  useEffect(() => {
    if (!meshRef.current) return
    const geo = meshRef.current.geometry
    const count = geo.attributes.position.count
    const colors = new Float32Array(count * 3)
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const time = clock.getElapsedTime()
    const amplitude = amplitudeRef.current
    const geo = meshRef.current.geometry
    const posAttr = geo.attributes.position
    const colorAttr = geo.attributes.color

    if (!posAttr || !colorAttr) return

    const tmp = new THREE.Color()
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const y = posAttr.getY(i)

      // Primary wave
      const wave = Math.sin(x * 2.0 + time * 0.8) * 0.3

      // Simplex noise displacement
      const noiseVal = noise3D(x * 0.5, y * 0.5, time * 0.3) * 0.5

      const displacement = (wave + noiseVal) * amplitude
      posAttr.setZ(i, displacement)

      // Color mapping based on displacement height
      // Normalize displacement to [0, 1] range roughly
      const normalizedH = THREE.MathUtils.clamp((displacement + 0.5) / 1.0, 0, 1)

      if (normalizedH < 0.5) {
        // Trough to mid: cyan to purple
        tmp.copy(colorCyan).lerp(colorPurple, normalizedH * 2)
      } else {
        // Mid to peak: purple to orange
        tmp.copy(colorPurple).lerp(colorOrange, (normalizedH - 0.5) * 2)
      }

      colorAttr.setXYZ(i, tmp.r, tmp.g, tmp.b)
    }

    posAttr.needsUpdate = true
    colorAttr.needsUpdate = true
  })

  return (
    <mesh ref={meshRef} position={[6.5, 5.0, -2]} rotation={[0, 0, 0]}>
      <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT, WIDTH_SEGS, HEIGHT_SEGS]} />
      <meshBasicMaterial
        wireframe
        vertexColors
        transparent
        opacity={0.7}
        toneMapped={false}
      />
    </mesh>
  )
}
