import { Html } from '@react-three/drei'

// Reference-style scattered HUD labels near nodes
const LABELS = [
  { text: 'NORSE EMTS', pos: [-5.5, 2.2, 0] },
  { text: 'KGM15 DSW5', pos: [-4.8, -0.2, 0] },
  { text: 'RSDAR', pos: [-3.0, 2.6, 0] },
  { text: 'NENDDXX', pos: [-3.6, 0.2, 0] },
  { text: 'DE3', pos: [-1.3, 2.8, 0] },
  { text: 'DEAJTCN', pos: [-1.8, 0.4, 0] },
  { text: 'SOAADOUCE', pos: [0.3, -0.2, 0] },
  { text: 'PROCESS1', pos: [1.4, 2.8, 0] },
  { text: 'DOSSTAKION', pos: [2.0, 0.2, 0] },
  { text: 'SCREDIZKON', pos: [3.0, 2.4, 0] },
  { text: 'S2CR', pos: [3.6, -0.1, 0] },
  { text: 'AUTO', pos: [5.3, 2.0, 0] },
  { text: 'AUTH', pos: [5.5, 1.4, 0] },
  { text: 'ENGINS', pos: [4.6, -0.3, 0] },
  { text: 'GUDPFEND', pos: [5.8, 0.0, 0] },
]

const labelStyle = {
  color: 'rgba(255, 255, 255, 0.3)',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '7px',
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
}

export default function HudLabels() {
  return (
    <group>
      {LABELS.map((l, i) => (
        <Html key={i} position={l.pos} style={labelStyle}>
          {l.text}
        </Html>
      ))}
    </group>
  )
}
