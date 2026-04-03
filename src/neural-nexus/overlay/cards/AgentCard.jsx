import React, { useState, useEffect, useRef } from 'react'
import { colors } from '../../utils/colors'

const LED_COUNT = 15

const AgentCard = ({ agent }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [displayMetric, setDisplayMetric] = useState(agent.metric)
  const [isSlotting, setIsSlotting] = useState(false)
  const intervalRef = useRef(null)

  // Determine if backend card (ids 5-7) for orange accent
  const isBackend = agent.id >= 5 && agent.id <= 7
  const accentColor = isBackend ? colors.orangeEnergy : colors.cyanPrimary
  const accentGlow = isBackend ? colors.orangeGlow : colors.cyanGlow

  // Determine if this agent uses a percentage metric
  const isPercentMetric = [1, 3, 5, 7].includes(agent.id)

  // Format a jittered metric value matching the agent's metric format
  const formatJitteredMetric = (jitter) => {
    const jitteredVal = agent.metricValue + jitter
    if (isPercentMetric) {
      // Reconstruct the percentage string with the same suffix
      const suffix = agent.metric.replace(/^[\d]+/, '') // e.g. "% optimized", "% complete", "% Uptime", "%"
      return `${jitteredVal}${suffix}`
    } else {
      // Non-percentage: keep the same text format, just vary the number
      // e.g. "Feature 14 Active" -> "Feature 16 Active", "118 Deployments" -> "120 Deployments"
      return agent.metric.replace(/[\d,]+/, jitteredVal.toLocaleString())
    }
  }

  // Smooth fade animation for metric updates every 3-7s
  useEffect(() => {
    const triggerSlot = () => {
      setIsSlotting(true)
      // Phase 1: fade out with jittered value
      const jitter = Math.floor(Math.random() * 7) - 3 // -3 to +3
      setDisplayMetric(formatJitteredMetric(jitter))

      // Phase 2: after fade-out, swap to real value and fade in
      setTimeout(() => {
        setDisplayMetric(agent.metric)
        setIsSlotting(false)
      }, 150)
    }

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 4000
      intervalRef.current = setTimeout(() => {
        triggerSlot()
        scheduleNext()
      }, delay)
    }

    scheduleNext()
    return () => clearTimeout(intervalRef.current)
  }, [agent.metric, agent.metricValue])

  const filledCount = Math.round((agent.progressPercent / 100) * LED_COUNT)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? colors.panelBgHover : colors.panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: `1px solid ${isHovered ? colors.panelBorderHover : colors.panelBorder}`,
        borderRadius: 8,
        padding: '14px 12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? `0 12px 40px rgba(0,0,0,0.5), 0 0 20px ${accentGlow}, inset 0 1px 0 rgba(255,255,255,0.05)`
          : '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: 'default',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Agent title */}
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: colors.textPrimary,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {agent.name}
      </div>

      {/* Task description */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: colors.cyanPrimary,
          letterSpacing: '0.03em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {agent.task}
      </div>

      {/* Primary metric with slot animation */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 18,
          fontWeight: 700,
          color: accentColor,
          letterSpacing: '0.02em',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          opacity: isSlotting ? 0 : 1,
          transform: isSlotting ? 'translateY(-8px)' : 'translateY(0)',
          textShadow: `0 0 10px ${accentGlow}`,
        }}
      >
        {displayMetric}
      </div>

      {/* LED progress bar */}
      <div style={{ display: 'flex', gap: 2, height: 4 }}>
        {Array.from({ length: LED_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 1,
              background: i < filledCount ? accentColor : 'rgba(255,255,255,0.08)',
              boxShadow: i < filledCount ? `0 0 4px ${accentGlow}` : 'none',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Status badge */}
      <div
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 4,
          background: 'rgba(0, 230, 118, 0.1)',
          border: '1px solid rgba(0, 230, 118, 0.3)',
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: colors.greenActive,
            boxShadow: `0 0 6px ${colors.greenGlow}`,
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: colors.greenActive,
            letterSpacing: '0.08em',
          }}
        >
          ACTIVE
        </span>
      </div>

      {/* Activity lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
        {agent.activities.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 7,
              color: colors.textMuted,
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentCard
