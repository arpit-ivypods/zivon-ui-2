import { useEffect, useRef, useState } from 'react'
import useDashboardStore from '../../store/useDashboardStore'
import { colors } from '../../utils/colors'

const BootSequence = () => {
  const setBooting = useDashboardStore((s) => s.setBooting)
  const overlayRef = useRef(null)
  const [phase, setPhase] = useState(0) // 0=loading, 1=fading, 2=done

  useEffect(() => {
    // Phase 0: show loading text for 2s, then start fading
    const t1 = setTimeout(() => {
      setPhase(1) // start fading overlay
    }, 2000)

    // Phase 1 complete: remove overlay after fade
    const t2 = setTimeout(() => {
      setPhase(2)
      setBooting(false)
    }, 3000) // 2000ms wait + 1000ms fade

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [setBooting])

  if (phase === 2) return null

  return (
    <>
      <style>{`
        @keyframes nn-boot-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes nn-boot-scan {
          0% { top: -2px; }
          100% { top: 100vh; }
        }
        @keyframes nn-boot-bar {
          0% { width: 0%; }
          100% { width: 80%; }
        }
      `}</style>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10000,
          background: colors.spaceVoid,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          transition: 'opacity 1s ease-out',
          opacity: phase >= 1 ? 0 : 1,
          pointerEvents: phase >= 1 ? 'none' : 'auto',
        }}
      >
        {/* Scanner line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${colors.cyanPrimary} 30%, ${colors.cyanPrimary} 70%, transparent 100%)`,
            boxShadow: `0 0 20px ${colors.cyanGlow}, 0 0 60px ${colors.cyanGlow}`,
            animation: 'nn-boot-scan 2s ease-in-out forwards',
          }}
        />

        {/* Logo */}
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `1px solid ${colors.cyanPrimary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 30px ${colors.cyanGlow}`,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors.cyanPrimary,
            boxShadow: `0 0 15px ${colors.cyanPrimary}`,
          }} />
        </div>

        {/* Boot text */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: colors.cyanPrimary,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            animation: 'nn-boot-pulse 1.5s ease-in-out infinite',
          }}
        >
          INITIALIZING NEURAL NEXUS
        </div>

        {/* Progress bar */}
        <div style={{
          width: 200,
          height: 2,
          background: 'rgba(0, 229, 255, 0.1)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${colors.cyanPrimary}, ${colors.purpleNeural})`,
            borderRadius: 1,
            animation: 'nn-boot-bar 2s ease-out forwards',
          }} />
        </div>
      </div>
    </>
  )
}

export default BootSequence
