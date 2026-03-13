import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

const nodeWidth = 250;
const nodeHeight = 80;

function getLayoutedElements(nodes, edges, direction = 'TB') {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

    nodes.forEach((node) => {
        g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        return {
            ...node,
            targetPosition: 'top',
            sourcePosition: 'bottom',
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}

const defaultNodeStyle = {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '2px solid var(--color-primary)',
    borderRadius: '8px',
    padding: '12px 20px',
    fontWeight: '600',
    fontSize: '14px',
    minWidth: '200px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
};

const defaultEdgeStyle = {
    stroke: 'var(--color-surface-border)',
    strokeWidth: 2,
    transition: 'all 0.3s ease',
};

export default function ArchitectureDiagram({ data }) {
    if (!data || !data.nodes || !data.edges || data.nodes.length === 0) {
        return <p className="text-muted">No architecture data available.</p>;
    }

    // Build initial nodes/edges with dagre layout
    const { layoutedNodes, layoutedEdges } = useMemo(() => {
        const baseNodes = data.nodes.map((n) => ({
            id: n.id,
            position: { x: 0, y: 0 },
            data: { label: n.label, fullData: n },
            style: { ...defaultNodeStyle },
        }));

        const baseEdges = data.edges.map((e) => ({
            id: `e-${e.from}-${e.to}`,
            source: e.from,
            target: e.to,
            animated: true,
            style: { ...defaultEdgeStyle },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--color-surface-border)',
            },
        }));

        const result = getLayoutedElements(baseNodes, baseEdges);
        return { layoutedNodes: result.nodes, layoutedEdges: result.edges };
    }, [data]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
    const [selectedNode, setSelectedNode] = useState(null);

    const clearSelection = useCallback(() => {
        setSelectedNode(null);
        // Reset all node styles
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                style: { ...defaultNodeStyle },
            }))
        );
        // Reset all edge styles
        setEdges((eds) =>
            eds.map((e) => ({
                ...e,
                animated: true,
                style: { ...defaultEdgeStyle, opacity: 1 },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: 'var(--color-surface-border)',
                },
            }))
        );
    }, [setNodes, setEdges]);

    const onNodeClick = useCallback(
        (_, node) => {
            const clickedData = node.data.fullData;
            setSelectedNode(clickedData);

            // Find connected edges
            const connectedEdgeIds = new Set();
            const connectedNodeIds = new Set([node.id]);

            edges.forEach((e) => {
                if (e.source === node.id || e.target === node.id) {
                    connectedEdgeIds.add(e.id);
                    connectedNodeIds.add(e.source);
                    connectedNodeIds.add(e.target);
                }
            });

            // Highlight connected edges, dim others
            setEdges((eds) =>
                eds.map((e) => {
                    const isConnected = connectedEdgeIds.has(e.id);
                    return {
                        ...e,
                        animated: isConnected,
                        style: {
                            stroke: isConnected
                                ? 'var(--color-accent)'
                                : 'var(--color-surface-border)',
                            strokeWidth: isConnected ? 3 : 1,
                            opacity: isConnected ? 1 : 0.2,
                            transition: 'all 0.3s ease',
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: isConnected
                                ? 'var(--color-accent)'
                                : 'var(--color-surface-border)',
                        },
                    };
                })
            );

            // Highlight selected & connected nodes, dim others
            setNodes((nds) =>
                nds.map((n) => {
                    const isSelected = n.id === node.id;
                    const isConnected = connectedNodeIds.has(n.id);
                    return {
                        ...n,
                        style: {
                            ...defaultNodeStyle,
                            opacity: isConnected ? 1 : 0.3,
                            border: isSelected
                                ? '2px solid var(--color-accent)'
                                : '2px solid var(--color-primary)',
                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: isSelected
                                ? '0 0 15px rgba(99, 102, 241, 0.4)'
                                : 'var(--shadow-md)',
                        },
                    };
                })
            );
        },
        [edges, setEdges, setNodes]
    );

    const onPaneClick = useCallback(() => {
        clearSelection();
    }, [clearSelection]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ── Diagram (ALWAYS visible) ─────────────── */}
            <div
                style={{
                    width: '100%',
                    height: '500px',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-surface-border)',
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    fitView
                    fitViewOptions={{ padding: 0.25 }}
                    minZoom={0.4}
                    maxZoom={2}
                    proOptions={{ hideAttribution: true }}
                >
                    <Controls
                        style={{ fill: 'var(--color-primary)' }}
                    />
                    <MiniMap
                        nodeColor="var(--color-primary)"
                        maskColor="var(--color-bg-alt)"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                    />
                    <Background color="var(--color-surface-border)" gap={16} />
                </ReactFlow>
            </div>

            {/* ── Component Details (shown BELOW diagram) ── */}
            {selectedNode && (
                <div
                    style={{
                        padding: '20px',
                        background: 'var(--color-bg-alt)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-primary-soft)',
                        animation: 'fadeIn 0.3s ease',
                    }}
                >
                    {/* Header: title + back button */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}
                    >
                        <h4
                            style={{
                                color: 'var(--color-accent)',
                                fontSize: 'var(--text-lg)',
                                margin: 0,
                            }}
                        >
                            🔍 {selectedNode.label}
                        </h4>
                        <button
                            onClick={clearSelection}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-surface-border)',
                                color: 'var(--color-text-secondary)',
                                padding: '6px 14px',
                                borderRadius: '999px',
                                fontSize: 'var(--text-sm)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.color = 'var(--color-text)';
                                e.currentTarget.style.background = 'var(--color-primary-soft)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-surface-border)';
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                                e.currentTarget.style.background = 'var(--color-surface)';
                            }}
                        >
                            ← Back to Diagram
                        </button>
                    </div>

                    {/* Explanation */}
                    {selectedNode.explanation && (
                        <p
                            style={{
                                color: 'var(--color-text-secondary)',
                                marginBottom: '16px',
                                lineHeight: 1.6,
                            }}
                        >
                            {selectedNode.explanation}
                        </p>
                    )}

                    {/* Related Files */}
                    {selectedNode.relatedFiles &&
                        selectedNode.relatedFiles.length > 0 && (
                            <div>
                                <h5
                                    style={{
                                        color: 'var(--color-text)',
                                        marginBottom: '8px',
                                        fontWeight: 600,
                                    }}
                                >
                                    📁 Related Files
                                </h5>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                    }}
                                >
                                    {selectedNode.relatedFiles.map((file, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                background: 'var(--color-surface)',
                                                border: '1px solid var(--color-surface-border)',
                                                padding: '4px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--text-xs)',
                                                fontFamily: 'var(--font-mono)',
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            📄 {file}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Fallback if no details exist */}
                    {!selectedNode.explanation &&
                        (!selectedNode.relatedFiles ||
                            selectedNode.relatedFiles.length === 0) && (
                            <p style={{ color: 'var(--color-text-muted)' }}>
                                No additional details available for this component.
                            </p>
                        )}
                </div>
            )}

            {/* Hint when nothing is selected */}
            {!selectedNode && (
                <p
                    style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--text-sm)',
                        textAlign: 'center',
                        margin: 0,
                    }}
                >
                    💡 Click a node above to see component details
                </p>
            )}
        </div>
    );
}
