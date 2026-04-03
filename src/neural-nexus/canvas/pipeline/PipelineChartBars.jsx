import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BAR_COUNT = 25
const BAR_WIDTH = 0.15
const X_MIN = -6
const X_MAX = 6
const BASE_Y = -0.5

function generateBarData() {
  const bars = []
  for (let i = 0; i < BAR_COUNT; i++) {
    const t = i / (BAR_COUNT - 1)
    const x = X_MIN + (X_MAX - X_MIN) * t
    const rawHeight = 10 + Math.random() * 110
    const height = rawHeight / 80 // normalize to scene units
    const isOrange = Math.random() < 0.25
    const breathePhase = Math.random() * Math.PI * 2
    const breathePeriod = 4 + Math.random() * 2
    bars.push({ x, height, isOrange, breathePhase, breathePeriod })
  }
  return bars
}

export default function PipelineChartBars() {
  const barsData = useMemo(generateBarData, [])
  const meshRefs = useRef([])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    for (let i = 0; i < barsData.length; i++) {
      const bar = barsData[i]
      const ref = meshRefs.current[i]
      if (!ref) continue
      const breathe = 1 + 0.03 * Math.sin((time * Math.PI * 2) / bar.breathePeriod + bar.breathePhase)
      const h = bar.height * breathe
      ref.scale.y = h
      ref.position.y = BASE_Y + h / 2
    }
  })

  return (
    <group position={[0, 0, -1]}>
      {barsData.map((bar, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          position={[bar.x, BASE_Y + bar.height / 2, 0]}
        >
          <boxGeometry args={[BAR_WIDTH, 1, 0.05]} />
          <meshBasicMaterial
            color={bar.isOrange ? '#FF9100' : '#0097A7'}
            transparent
            opacity={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}
