import { useState } from 'react'
import DashboardFlat from './pages/DashboardFlat'
import Dashboard3D from './pages/Dashboard3D'
import NeuralNexus from './neural-nexus/NeuralNexus'

const PAGES = [
  { key: 'neural', label: 'Neural Nexus', component: NeuralNexus },
  { key: 'flat', label: 'Classic', component: DashboardFlat },
  { key: '3d',   label: '3D View', component: Dashboard3D },
]

export default function App() {
  const [pageIdx, setPageIdx] = useState(0)
  const Page = PAGES[pageIdx].component

  return (
    <>
      <Page />

      {/* Page switcher — floating pill */}
      <div style={{
        position: 'fixed',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        gap: 2,
        background: 'rgba(6, 10, 20, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(100, 160, 255, 0.15)',
        borderRadius: 10,
        padding: 3,
      }}>
        {PAGES.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setPageIdx(i)}
            style={{
              background: i === pageIdx
                ? 'rgba(79, 195, 247, 0.2)'
                : 'transparent',
              border: i === pageIdx
                ? '1px solid rgba(79, 195, 247, 0.35)'
                : '1px solid transparent',
              borderRadius: 8,
              color: i === pageIdx ? '#4fc3f7' : 'rgba(200,220,255,0.5)',
              fontSize: 11,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '6px 18px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </>
  )
}
