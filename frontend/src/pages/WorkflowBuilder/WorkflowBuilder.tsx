import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type OnConnect,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';

import '@xyflow/react/dist/style.css';

import { ActionIcon, Box, Button, Group, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import { nodeTypes } from '@components/WorkflowNodes';

import NodePanel from './NodePanel';
import styles from './styles.module.scss';

const defaultData: Record<string, Record<string, unknown>> = {
  intent: { intent: '' },
  static_reply: { message: '' },
  collect_input: { prompt: '', variable: '' },
  api_call: { method: 'GET', endpoint: '' },
  knowledge_base: { kbId: 0 },
  llm_generate: {},
  end_conversation: {},
};

const WorkflowBuilderInner = () => {
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setNodes((nds) => [...nds, { id: uuid(), type, position, data: defaultData[type] ?? {} }]);
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <Box className={styles.page}>
      <Box className={styles.header}>
        <Group justify="space-between" h="100%" px="md">
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Text fw={600} size="sm">
              Workflow Builder
            </Text>
          </Group>
          <Button size="xs">Save</Button>
        </Group>
      </Box>

      <Box className={styles.body}>
        <NodePanel />
        <Box className={styles.canvas} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="var(--mantine-color-dark-4)"
            />
            <Controls />
          </ReactFlow>
        </Box>
      </Box>
    </Box>
  );
};

const WorkflowBuilder = () => (
  <ReactFlowProvider>
    <WorkflowBuilderInner />
  </ReactFlowProvider>
);

export default WorkflowBuilder;
