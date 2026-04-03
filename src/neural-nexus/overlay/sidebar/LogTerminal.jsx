import React, { useEffect, useRef } from 'react'
import useDashboardStore from '../../store/useDashboardStore'
import { colors } from '../../utils/colors'

const LogTerminal = () => {
  const logs = useDashboardStore((s) => s.logs)
  const addLog = useDashboardStore((s) => s.addLog)
  const scrollRef = useRef(null)

  // Add new log every 1.5-2.5s
  useEffect(() => {
    let timeout
    const schedule = () => {
      const delay = 1500 + Math.random() * 1000
      timeout = setTimeout(() => {
        addLog()
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const entryKeyframes = `
    @keyframes nn-log-slidein {
      from { opacity: 0; transform: translateX(-16px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `

  return (
    <div
      style={{
        background: 'rgba(5, 10, 20, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 8,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        height: '100%',
        overflow: 'hidden',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
        flexShrink: 1,
      }}
    >
      <style>{entryKeyframes}</style>

      {/* Terminal header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff5f56' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#27c93f' }} />
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: colors.textMuted,
            letterSpacing: '0.06em',
          }}
        >
          SYSTEM LOG
        </span>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        className="nn-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {logs.slice(-50).map((log) => (
          <div
            key={log.id}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              lineHeight: 1.5,
              color: colors.textMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              animation: 'nn-log-slidein 0.4s ease-out',
            }}
          >
            <span style={{ color: colors.cyanPrimary, marginRight: 6 }}>
              {log.timestamp}
            </span>
            {log.type === 'code' ? (
              <>
                <span style={{ color: colors.greenActive }}>[CODE]</span>{' '}
                <span style={{ color: colors.textSecondary }}>
                  {log.message.replace('[CODE] ', '')}
                </span>
              </>
            ) : (
              <span style={{ color: colors.textSecondary }}>{log.message}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogTerminal
