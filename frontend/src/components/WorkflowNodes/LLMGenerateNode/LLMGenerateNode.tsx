import { type NodeProps, type Node } from '@xyflow/react';

import { Text } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type LLMGenerateNodeData } from '../types';

type LLMGenerateNodeType = Node<LLMGenerateNodeData, 'llm_generate'>;

const LLMGenerateNode = ({ data, selected }: NodeProps<LLMGenerateNodeType>) => (
  <BaseNode title="LLM Generate" color="indigo" icon={<IconSparkles size={14} />} selected={selected}>
    {data.replyTemplate ? (
      <Text size="xs" c="dimmed" lineClamp={2}>{data.replyTemplate}</Text>
    ) : (
      <Text size="xs" c="dimmed" fs="italic">Free-form AI response</Text>
    )}
  </BaseNode>
);

export default LLMGenerateNode;
