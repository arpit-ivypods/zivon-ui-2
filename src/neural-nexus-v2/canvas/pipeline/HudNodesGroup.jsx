import { engineNodes } from '../../../neural-nexus/utils/mockData'
import HudNode from './HudNode'

// Icon symbols for each engine node
const NODE_ICONS = {
  1: '\u2B21',   // Insighting: hexagon
  2: '\u25A6',   // Product: grid square
  3: '\u25B3',   // Design: triangle
  4: '</>',      // Frontend: code brackets
  5: '\u2699',   // Backend: gear
  6: '\u26C1',   // DB: cylinder/stacked discs
  7: '\u2713',   // QA: checkmark
}

export default function HudNodesGroup() {
  return (
    <group>
      {engineNodes.map((node, i) => (
        <HudNode
          key={node.id}
          position={[node.x, node.y, node.z]}
          name={node.name}
          metric={node.metric}
          index={i}
          icon={NODE_ICONS[node.id] || '?'}
        />
      ))}
    </group>
  )
}
