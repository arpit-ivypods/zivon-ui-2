import React, { useEffect, useRef, useCallback } from 'react'
import useDashboardStore from '../../store/useDashboardStore'
import { colors } from '../../utils/colors'

const CHART_W = 160
const CHART_H = 70
const POINTS = 30

const buildPath = (data, w, h) => {
  const stepX = w / (POINTS - 1)
  const minV = 0
  const maxV = 100
  return data
    .map((v, i) => {
      const x = i * stepX
      const y = h - ((v - minV) / (maxV - minV)) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

const buildAreaPath = (data, w, h) => {
  const linePath = buildPath(data, w, h)
  const stepX = w / (POINTS - 1)
  return `${linePath} L${((POINTS - 1) * stepX).toFixed(1)},${h} L0,${h} Z`
}

const RollingChart = () => {
  const performanceData = useDashboardStore((s) => s.performanceData)
  const cpuData = useDashboardStore((s) => s.cpuData)
  const memoryData = useDashboardStore((s) => s.memoryData)
  const updateMetrics = useDashboardStore((s) => s.updateMetrics)

  useEffect(() => {
    const interval = setInterval(updateMetrics, 1500)
    return () => clearInterval(interval)
  }, [])

  const perfPath = buildPath(performanceData, CHART_W, CHART_H)
  const perfArea = buildAreaPath(performanceData, CHART_W, CHART_H)
  const cpuPath = buildPath(cpuData, CHART_W, CHART_H)
  const memPath = buildPath(memoryData, CHART_W, CHART_H)

  return (
    <svg
      width={CHART_W}
      height={CHART_H}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      style={{ width: '100%', maxWidth: 160, height: 70, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="nn-perf-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.cyanPrimary} stopOpacity={0.2} />
          <stop offset="100%" stopColor={colors.cyanPrimary} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Area fill for performance */}
      <path d={perfArea} fill="url(#nn-perf-fill)" />
      {/* Performance line - cyan solid */}
      <path d={perfPath} fill="none" stroke={colors.cyanPrimary} strokeWidth={1.5} strokeLinejoin="round" />
      {/* CPU line - orange dashed */}
      <path d={cpuPath} fill="none" stroke={colors.orangeEnergy} strokeWidth={1} strokeDasharray="4 3" strokeLinejoin="round" />
      {/* Memory line - purple dotted */}
      <path d={memPath} fill="none" stroke={colors.purpleNeural} strokeWidth={1} strokeDasharray="2 2" strokeLinejoin="round" />
    </svg>
  )
}

const SystemOverview = () => {
  const totalTasks = useDashboardStore((s) => s.totalTasks)
  const tickTotalTasks = useDashboardStore((s) => s.tickTotalTasks)

  useEffect(() => {
    const interval = setInterval(tickTotalTasks, 3000)
    return () => clearInterval(interval)
  }, [])

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
        gap: 8,
        maxHeight: 160,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: colors.textPrimary,
          letterSpacing: '0.06em',
        }}
      >
        SYSTEM OVERVIEW
      </div>

      {/* Bullet items + Chart in a row */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        {/* Bullet items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
          {['Graphs', 'Performance Metrics', 'CPU/Memory Usage'].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: colors.textSecondary,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: colors.cyanPrimary,
                  boxShadow: `0 0 6px ${colors.cyanGlow}`,
                  flexShrink: 0,
                }}
              />
              {item}
            </div>
          ))}

          {/* Task counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: colors.cyanPrimary,
                textShadow: `0 0 8px ${colors.cyanGlow}`,
                transition: 'all 0.3s ease',
              }}
            >
              {totalTasks.toLocaleString()}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: colors.textMuted,
                letterSpacing: '0.05em',
              }}
            >
              Tasks
            </span>
          </div>
        </div>

        {/* Chart column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 160 }}>
          {/* Chart legend */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Perf', color: colors.cyanPrimary },
              { label: 'CPU', color: colors.orangeEnergy },
              { label: 'Mem', color: colors.purpleNeural },
            ].map((l) => (
              <div
                key={l.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 7,
                  color: colors.textMuted,
                }}
              >
                <div style={{ width: 8, height: 2, background: l.color, borderRadius: 1 }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Rolling chart */}
          <div
            style={{
              borderRadius: 4,
              border: `1px solid ${colors.panelBorder}`,
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            <RollingChart />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemOverview
