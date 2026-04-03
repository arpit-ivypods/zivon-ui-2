export default function LightingV2() {
  return (
    <>
      {/* Ambient base illumination - slightly brighter than v1 */}
      <ambientLight intensity={0.2} color="#0a1628" />

      {/* Cyan accent - left side - stronger */}
      <pointLight
        position={[-5, 3, 5]}
        color="#00E5FF"
        intensity={1.2}
        distance={25}
        decay={2}
      />

      {/* Orange accent - right side - stronger */}
      <pointLight
        position={[5, 2, 5]}
        color="#FF9100"
        intensity={1.0}
        distance={25}
        decay={2}
      />

      {/* Purple accent - overhead center */}
      <pointLight
        position={[0, 4, 3]}
        color="#9D4EDD"
        intensity={0.6}
        distance={18}
        decay={2}
      />
    </>
  )
}
