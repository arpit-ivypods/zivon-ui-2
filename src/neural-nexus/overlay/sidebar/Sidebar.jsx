import React, { useEffect, useRef } from 'react'
import useDashboardStore from '../../store/useDashboardStore'
import VoicePanel from './VoicePanel'
import Transcript from './Transcript'
import SystemOverview from './SystemOverview'
import AgentStatusList from './AgentStatusList'
import ProjectMilestones from './ProjectMilestones'
import LogTerminal from './LogTerminal'

const Sidebar = () => {
  const setVoiceState = useDashboardStore((s) => s.setVoiceState)
  const timerRef = useRef(null)

  // Voice state cycle: idle -> humanSpeaking -> idle -> aiSpeaking -> repeat
  useEffect(() => {
    const states = [
      { state: 'idle', duration: 4000 + Math.random() * 2000 },
      { state: 'humanSpeaking', duration: 2000 + Math.random() * 1000 },
      { state: 'idle', duration: 1000 },
      { state: 'aiSpeaking', duration: 3000 + Math.random() * 2000 },
    ]
    let idx = 0
    const next = () => {
      const { state, duration } = states[idx % states.length]
      setVoiceState(state)
      idx++
      timerRef.current = setTimeout(next, duration)
    }
    timerRef.current = setTimeout(next, 2000)
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      className="nn-scrollbar"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingLeft: 8,
        paddingRight: 4,
        paddingBottom: 8,
        boxSizing: 'border-box',
      }}
    >
      <VoicePanel />
      <Transcript />
      <SystemOverview />
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AgentStatusList />
        </div>
        <ProjectMilestones />
      </div>
      <div style={{ flex: 1, minHeight: 180 }}>
        <LogTerminal />
      </div>
    </div>
  )
}

export default Sidebar
