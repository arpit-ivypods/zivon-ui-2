export default function LightingV2() {
  return (
    <>
      {/* Near-zero ambient - scene should be DARK, only emissive objects visible */}
      <ambientLight intensity={0.05} color="#0a1628" />

      {/* Cyan accent - left side - subtle */}
      <pointLight
        position={[-5, 3, 5]}
        color="#00E5FF"
        intensity={0.3}
        distance={20}
        decay={2}
      />

      {/* Orange accent - right side - very subtle */}
      <pointLight
        position={[5, 2, 5]}
        color="#FF9100"
        intensity={0.2}
        distance={20}
        decay={2}
      />

      {/* Purple accent - overhead */}
      <pointLight
        position={[6, 4, 3]}
        color="#9D4EDD"
        intensity={0.15}
        distance={15}
        decay={2}
      />
    </>
  )
}
