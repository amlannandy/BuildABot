import { type NodeProps, type Node } from '@xyflow/react';

import { Text } from '@mantine/core';
import { IconDatabase } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type KnowledgeBaseNodeData } from '../types';

type KnowledgeBaseNodeType = Node<KnowledgeBaseNodeData, 'knowledge_base'>;

const KnowledgeBaseNode = ({ data, selected }: NodeProps<KnowledgeBaseNodeType>) => (
  <BaseNode title="Knowledge Base" color="teal" icon={<IconDatabase size={14} />} intent={data.intent} hasInput={!data.intent} selected={selected}>
    {data.kbId ? (
      <Text size="xs" c="dimmed">{data.kbName ?? `Knowledge Base #${data.kbId}`}</Text>
    ) : (
      <Text size="xs" c="dimmed" fs="italic">No knowledge base selected</Text>
    )}
  </BaseNode>
);

export default KnowledgeBaseNode;
