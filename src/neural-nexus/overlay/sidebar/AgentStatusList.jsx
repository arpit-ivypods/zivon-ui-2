import React from 'react'
import { colors } from '../../utils/colors'
import { agentStatuses } from '../../utils/mockData'

const AgentStatusList = () => {
  const pingKeyframes = `
    @keyframes nn-ping-0 {
      0% { box-shadow: 0 0 0 0 rgba(0,230,118,0.7); }
      70% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
      100% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
    }
    @keyframes nn-ping-1 {
      0% { box-shadow: 0 0 0 0 rgba(0,230,118,0.7); }
      70% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
      100% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
    }
    @keyframes nn-ping-2 {
      0% { box-shadow: 0 0 0 0 rgba(0,230,118,0.7); }
      70% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
      100% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
    }
    @keyframes nn-ping-3 {
      0% { box-shadow: 0 0 0 0 rgba(0,230,118,0.7); }
      70% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
      100% { box-shadow: 0 0 0 8px rgba(0,230,118,0); }
    }
  `

  return (
    <div
      style={{
        background: colors.panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}
    >
      <style>{pingKeyframes}</style>

      {agentStatuses.map((agent, idx) => (
        <div
          key={agent.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* Pulsing green dot with staggered animation */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: colors.greenActive,
              boxShadow: `0 0 6px ${colors.greenGlow}`,
              animation: `nn-ping-${idx} 2s ease-out infinite`,
              animationDelay: `${idx * 0.5}s`,
              flexShrink: 0,
            }}
          />

          {/* Agent name */}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: colors.textSecondary,
              letterSpacing: '0.04em',
              flex: 1,
            }}
          >
            {agent.name}
          </span>

          {/* ACTIVE badge */}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 7,
              color: colors.greenActive,
              letterSpacing: '0.08em',
              padding: '2px 6px',
              borderRadius: 3,
              background: 'rgba(0,230,118,0.1)',
              border: '1px solid rgba(0,230,118,0.25)',
            }}
          >
            {agent.status}
          </span>
        </div>
      ))}
    </div>
  )
}

export default AgentStatusList
