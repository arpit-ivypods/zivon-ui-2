import { engineNodes } from '../../utils/mockData'
import EngineNode from './EngineNode'

export default function EngineNodesGroup() {
  return (
    <group>
      {engineNodes.map((node, i) => (
        <EngineNode
          key={node.id}
          position={[node.x, node.y, node.z]}
          name={node.name}
          metric={node.metric}
          index={i}
        />
      ))}
    </group>
  )
}
