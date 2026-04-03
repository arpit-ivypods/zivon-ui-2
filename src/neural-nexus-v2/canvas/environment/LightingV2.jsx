export default function LightingV2() {
  return (
    <>
      {/* Low ambient — pipes mostly self-illuminated via emissive */}
      <ambientLight intensity={0.08} color="#0a1628" />

      {/* Directional from above — creates specular streaks on pipe tops */}
      <directionalLight position={[0, 10, 5]} color="#FFFFFF" intensity={0.3} />

      {/* Cyan tint — left side */}
      <pointLight position={[-4, 3, 3]} color="#00E5FF" intensity={0.4} distance={15} decay={2} />

      {/* Orange tint — right side */}
      <pointLight position={[4, 2, 3]} color="#FFB800" intensity={0.3} distance={15} decay={2} />

      {/* Fill — center */}
      <pointLight position={[0, 0, 5]} color="#FFFFFF" intensity={0.15} distance={20} decay={2} />
    </>
  )
}
