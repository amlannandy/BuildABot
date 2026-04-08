import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
  type NodeTypes,
  type OnConnect,
} from '@xyflow/react';
import { v4 as uuid } from 'uuid';

import '@xyflow/react/dist/style.css';

import { ActionIcon, Box, Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconError404 } from '@tabler/icons-react';

import { nodeTypes } from '@components/WorkflowNodes';
import { useGetChatBot } from '@hooks/chatbots/useGetChatBot';
import { useUpdateChatBot } from '@hooks/chatbots/useUpdateChatBot';
import useSafeNavigate from '@hooks/useSafeNavigate';

import NodePanel from './NodePanel';
import styles from './styles.module.scss';
import { transformAPIResponseIntoNodeData, transformNodeDataIntoAPIRequest } from './utils';

const defaultData: Record<string, Record<string, unknown>> = {
  static_reply: { message: '' },
  collect_input: { prompt: '', variable: '' },
  api_call: { method: 'GET', endpoint: '' },
  knowledge_base: { kbId: 0 },
  llm_generate: {},
  end_conversation: { message: '' },
};

const WorkflowBuilderInner = () => {
  const { goBack } = useSafeNavigate();
  const { id } = useParams<{ id: string }>();
  const chatbotId = Number(id ?? 0);
  const { screenToFlowPosition } = useReactFlow();

  const {
    data: chatbotData,
    isPending: isChatBotPending,
    isError: isChatBotError,
  } = useGetChatBot(chatbotId);
  const { mutate: updateChatBot, isPending: isUpdatingChatBot } = useUpdateChatBot();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  useEffect(() => {
    if (!chatbotData) return;
    const { nodes: initialNodes, edges: initialEdges } =
      transformAPIResponseIntoNodeData(chatbotData);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [chatbotData, setNodes, setEdges]);

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
      const data =
        type === 'knowledge_base' ? { ...defaultData[type], chatbotId } : (defaultData[type] ?? {});
      setNodes((nds) => [...nds, { id: uuid(), type, position, data }]);
    },
    [chatbotId, screenToFlowPosition, setNodes],
  );

  const handleUpdateChatBot = () => {
    const workflowData = transformNodeDataIntoAPIRequest(nodes, edges);
    updateChatBot(
      {
        id: chatbotId,
        workflow: {
          nodes: workflowData,
        },
      },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            message: 'Workflow successfully updated!',
          });
        },
      },
    );
  };

  return (
    <Box className={styles.page}>
      <Box className={styles.header}>
        <Group justify="space-between" h="100%" px="md">
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" onClick={goBack}>
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Text fw={600} size="sm">
              Workflow Builder
            </Text>
          </Group>
          <Button
            size="xs"
            loading={isUpdatingChatBot || isChatBotPending}
            onClick={handleUpdateChatBot}
          >
            Save
          </Button>
        </Group>
      </Box>

      <Box className={styles.body}>
        <NodePanel />
        <Box className={styles.canvas} onDragOver={onDragOver} onDrop={onDrop}>
          {isChatBotPending || isUpdatingChatBot ? (
            <Center h="100%">
              <Loader />
            </Center>
          ) : isChatBotError ? (
            <Center h="100%">
              <Stack gap="xs" align="center">
                <IconError404 size={48} />
                <Text c="red">Error loading chatbot data</Text>
              </Stack>
            </Center>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes as NodeTypes}
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
          )}
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
