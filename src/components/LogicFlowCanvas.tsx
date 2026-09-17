import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, Connection, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

interface LogicFlowCanvasProps {
  stackedIds: string[];
  availablePresets: any;
  onRemoveBlock: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const LogicFlowCanvas: React.FC<LogicFlowCanvasProps> = ({ 
  stackedIds, 
  availablePresets,
  onRemoveBlock,
  onMoveUp,
  onMoveDown
}) => {
  const nodes: Node[] = useMemo(() => {
    const nodesList: Node[] = [];
    
    // Ingress Node
    nodesList.push({
      id: 'ingress',
      type: 'input',
      data: { label: 'INGRESS' },
      position: { x: 250, y: 0 },
      style: { background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '10px' },
    });

    stackedIds.forEach((id, idx) => {
      const preset = availablePresets[id];
      nodesList.push({
        id: `block-${idx}`,
        data: { 
          label: (
            <div className="flex flex-col items-center">
              <span className="font-bold text-xs">{preset.metadata.name}</span>
              <div className="flex gap-1 mt-1">
                <button onClick={() => onMoveUp(idx)} className="p-1 hover:bg-slate-700 rounded">▲</button>
                <button onClick={() => onMoveDown(idx)} className="p-1 hover:bg-slate-700 rounded">▼</button>
                <button onClick={() => onRemoveBlock(idx)} className="p-1 hover:bg-rose-900 rounded">✖</button>
              </div>
            </div>
          ) 
        },
        position: { x: 250, y: 100 + (idx * 120) },
        style: { background: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', borderRadius: '12px', width: 200 },
      });
    });

    // Egress Node
    nodesList.push({
      id: 'egress',
      type: 'output',
      data: { label: 'EGRESS' },
      position: { x: 250, y: 100 + (stackedIds.length * 120) },
      style: { background: '#1e293b', border: '1px solid #334155', color: '#6ee7b7', borderRadius: '8px', padding: '10px' },
    });

    return nodesList;
  }, [stackedIds, availablePresets, onRemoveBlock, onMoveUp, onMoveDown]);

  const edges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    
    // Ingress to first block or egress
    const firstTarget = stackedIds.length > 0 ? 'block-0' : 'egress';
    edgesList.push({ id: 'e-ingress', source: 'ingress', target: firstTarget, markerEnd: { type: MarkerType.ArrowClosed } });

    stackedIds.forEach((_, idx) => {
      const source = `block-${idx}`;
      const target = idx === stackedIds.length - 1 ? 'egress' : `block-${idx + 1}`;
      edgesList.push({ id: `e-${idx}`, source, target, markerEnd: { type: MarkerType.ArrowClosed } });
    });

    return edgesList;
  }, [stackedIds]);

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
