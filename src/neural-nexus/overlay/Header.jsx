import React, { useMemo } from 'react'
import useDashboardStore from '../store/useDashboardStore'
import { colors } from '../utils/colors'

const AtomLogo = () => {
  const size = 36
  const cx = size / 2
  const cy = size / 2

  const keyframesStyle = `
    @keyframes nn-orbit1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes nn-orbit2 { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
    @keyframes nn-orbit3 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes nn-core-pulse { 0%,100% { r: 2.5; opacity: 0.9; } 50% { r: 3.5; opacity: 1; } }
  `

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <style>{keyframesStyle}</style>
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'nn-orbit1 20s linear infinite' }}>
        <ellipse cx={cx} cy={cy} rx={14} ry={6} fill="none" stroke={colors.cyanPrimary} strokeWidth={0.8} opacity={0.6} />
      </g>
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'nn-orbit2 15s linear infinite' }}>
        <ellipse cx={cx} cy={cy} rx={14} ry={6} fill="none" stroke={colors.cyanPrimary} strokeWidth={0.8} opacity={0.5} transform={`rotate(60 ${cx} ${cy})`} />
      </g>
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'nn-orbit3 25s linear infinite' }}>
        <ellipse cx={cx} cy={cy} rx={14} ry={6} fill="none" stroke={colors.cyanPrimary} strokeWidth={0.8} opacity={0.4} transform={`rotate(-60 ${cx} ${cy})`} />
      </g>
      <circle cx={cx} cy={cy} r={2.5} fill={colors.cyanPrimary} style={{ animation: 'nn-core-pulse 2s ease-in-out infinite' }}>
        <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

const Header = () => {
  const activeTab = useDashboardStore((s) => s.activeTab)
  const setActiveTab = useDashboardStore((s) => s.setActiveTab)

  const tabs = useMemo(() => ['AGENT STATUS', 'PHASES: 7', 'AGENT'], [])

  const scannerKeyframes = `
    @keyframes nn-scanner-slide {
      0% { transform: translateX(-120px); }
      100% { transform: translateX(calc(100vw + 120px)); }
    }
  `

  return (
    <div
      style={{
        width: '100%',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <style>{scannerKeyframes}</style>

      {/* Left cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AtomLogo />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: colors.textPrimary,
                letterSpacing: '0.05em',
              }}
            >
              NEURAL NEXUS
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 12,
                color: colors.cyanPrimary,
                letterSpacing: '0.08em',
              }}
            >
              | MULTI-AGENT DEVELOPMENT HUB
            </span>
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: colors.textSecondary,
              letterSpacing: '0.04em',
            }}
          >
            Active Agents: 7 / Status:{' '}
            <span
              style={{
                color: colors.greenActive,
                animation: 'neon-flicker 4.5s ease-in-out infinite',
              }}
            >
              OPTIMAL
            </span>
          </div>
        </div>
      </div>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Year badge */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: colors.cyanPrimary,
            border: `1px solid ${colors.panelBorder}`,
            borderRadius: 20,
            padding: '4px 14px',
            letterSpacing: '0.1em',
          }}
        >
          2043
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: activeTab === idx ? '#00E5FF' : colors.textMuted,
                background: activeTab === idx ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                border: `1px solid ${activeTab === idx ? 'rgba(0, 229, 255, 0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 4,
                padding: '6px 14px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === idx ? '0 0 10px rgba(0, 229, 255, 0.2)' : 'none',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom border with scanning gradient line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 120,
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${colors.cyanPrimary}, transparent)`,
            animation: 'nn-scanner-slide 8s linear infinite',
          }}
        />
      </div>
    </div>
  )
}

export default Header
