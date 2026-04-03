import { useState, useEffect } from 'react'
import Header from './Header'
import CardRow from './cards/CardRow'
import Sidebar from './sidebar/Sidebar'
import Vignette from './effects/Vignette'
import BootSequence from './effects/BootSequence'
import useDashboardStore from '../store/useDashboardStore'

const DashboardGrid = () => {
  const isBooting = useDashboardStore((s) => s.isBooting)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <BootSequence />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gridTemplateRows: '60px 1fr 260px',
          gap: 0,
          padding: 12,
          boxSizing: 'border-box',
        }}
      >
        {/* Header - row 1, span 2 cols */}
        <div
          style={{
            gridColumn: '1 / -1',
            gridRow: '1',
            pointerEvents: 'auto',
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
          }}
        >
          <Header />
        </div>

        {/* Main stage area - row 2, col 1 - transparent for canvas to show */}
        <div
          style={{
            gridColumn: '1',
            gridRow: '2',
          }}
        />

        {/* Sidebar - row 2-3, col 2 */}
        <div
          style={{
            gridColumn: '2',
            gridRow: '2 / 4',
            pointerEvents: 'auto',
            overflow: 'hidden',
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateX(0)' : 'translateX(30px)',
            transition: 'opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s',
          }}
        >
          <Sidebar />
        </div>

        {/* Bottom Cards - row 3, col 1 */}
        <div
          style={{
            gridColumn: '1',
            gridRow: '3',
            pointerEvents: 'auto',
            overflow: 'hidden',
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
          }}
        >
          <CardRow />
        </div>
      </div>
      <Vignette />
    </>
  )
}

export default DashboardGrid
