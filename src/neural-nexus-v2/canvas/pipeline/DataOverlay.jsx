import { Text } from '@react-three/drei'

// Y-axis scale labels on the far left
const Y_AXIS_LABELS = [
  { value: '150', y: 2.5 },
  { value: '40', y: 2.0 },
  { value: '30', y: 1.5 },
  { value: '20', y: 1.0 },
  { value: '10', y: 0.5 },
  { value: '0', y: 0.0 },
  { value: '-20', y: -0.5 },
]

// Scattered tech labels near nodes/pipeline area
const TECH_LABELS = [
  { text: 'REACT', x: -0.5, y: 2.8, z: 0.1 },
  { text: 'GRAPHQL', x: 2.2, y: 2.5, z: 0.1 },
  { text: 'SQL', x: 3.8, y: 1.9, z: 0.1 },
  { text: 'PROCESS', x: -4.2, y: 1.6, z: 0.1 },
  { text: 'ACTIVE', x: -2.0, y: 2.6, z: 0.1 },
  { text: 'NODE.JS', x: 1.2, y: 0.4, z: 0.1 },
  { text: 'API', x: 4.5, y: 0.3, z: 0.1 },
  { text: 'CACHE', x: -3.6, y: 0.2, z: 0.1 },
  { text: 'PIPELINE', x: 0.0, y: -0.3, z: 0.1 },
  { text: 'SCHEMA', x: 3.0, y: 0.0, z: 0.1 },
  { text: 'DEPLOY', x: -1.5, y: 0.1, z: 0.1 },
  { text: 'TEST', x: 5.2, y: 1.4, z: 0.1 },
]

export default function DataOverlay() {
  return (
    <group>
      {/* Y-axis labels on the far left */}
      {Y_AXIS_LABELS.map((label, i) => (
        <Text
          key={`y-${i}`}
          position={[-6.8, label.y, 0.1]}
          fontSize={0.07}
          color="white"
          anchorX="right"
          anchorY="middle"
          toneMapped={false}
          fillOpacity={0.25}
        >
          {label.value}
        </Text>
      ))}

      {/* Y-axis tick marks */}
      {Y_AXIS_LABELS.map((label, i) => (
        <mesh key={`tick-${i}`} position={[-6.55, label.y, 0.1]}>
          <planeGeometry args={[0.15, 0.005]} />
          <meshBasicMaterial color="white" transparent opacity={0.15} />
        </mesh>
      ))}

      {/* Scattered tech labels */}
      {TECH_LABELS.map((label, i) => (
        <Text
          key={`tech-${i}`}
          position={[label.x, label.y, label.z]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
          toneMapped={false}
          fillOpacity={0.2}
        >
          {label.text}
        </Text>
      ))}
    </group>
  )
}
