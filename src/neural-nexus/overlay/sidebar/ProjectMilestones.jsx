import React, { useState, useEffect } from 'react'
import useDashboardStore from '../../store/useDashboardStore'
import { colors } from '../../utils/colors'

const RING_SIZE = 64
const STROKE_WIDTH = 5
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ProjectMilestones = () => {
  const percent = useDashboardStore((s) => s.projectMilestonePercent)
  const [animatedPercent, setAnimatedPercent] = useState(0)

  // Animate the ring fill on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedPercent(percent)
    }, 300)
    return () => clearTimeout(timeout)
  }, [percent])

  const offset = CIRCUMFERENCE - (animatedPercent / 100) * CIRCUMFERENCE

  return (
    <div
      style={{
        background: colors.panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 8,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}
    >
      {/* SVG circular progress ring */}
      <div style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}>
        <svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={colors.cyanPrimary}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            style={{
              transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 4px ${colors.cyanGlow})`,
            }}
          />
        </svg>
        {/* Center percentage */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: colors.cyanPrimary,
            textShadow: `0 0 8px ${colors.cyanGlow}`,
          }}
        >
          {percent}%
        </div>
      </div>

      {/* Label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: colors.textPrimary,
            letterSpacing: '0.06em',
          }}
        >
          PROJECT MILESTONES
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: colors.textMuted,
            letterSpacing: '0.04em',
          }}
        >
          {percent}% complete
        </div>
      </div>
    </div>
  )
}

export default ProjectMilestones
