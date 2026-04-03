export default function Lighting() {
  return (
    <>
      {/* Ambient base illumination */}
      <ambientLight intensity={0.15} color="#0a1628" />

      {/* Cyan accent - left side */}
      <pointLight
        position={[-5, 3, 5]}
        color="#00E5FF"
        intensity={0.8}
        distance={20}
        decay={2}
      />

      {/* Orange accent - right side */}
      <pointLight
        position={[5, 2, 5]}
        color="#FF9100"
        intensity={0.6}
        distance={20}
        decay={2}
      />

      {/* Purple accent - top right */}
      <pointLight
        position={[6, 4, 3]}
        color="#9D4EDD"
        intensity={0.5}
        distance={15}
        decay={2}
      />
    </>
  )
}
