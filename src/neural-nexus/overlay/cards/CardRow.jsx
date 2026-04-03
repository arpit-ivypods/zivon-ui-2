import React from 'react'
import AgentCard from './AgentCard'
import useDashboardStore from '../../store/useDashboardStore'

const CardRow = () => {
  const agents = useDashboardStore((s) => s.agents)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 12,
        padding: '16px 20px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        alignContent: 'start',
      }}
    >
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}

export default CardRow
