import { type NodeProps, type Node } from '@xyflow/react';

import { Text } from '@mantine/core';
import { IconPlayerStop } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type EndConversationNodeData } from '../types';

type EndConversationNodeType = Node<EndConversationNodeData, 'end_conversation'>;

const EndConversationNode = ({ data, selected }: NodeProps<EndConversationNodeType>) => (
  <BaseNode title="End Conversation" color="red" icon={<IconPlayerStop size={14} />} hasOutput={false} selected={selected}>
    {data.message ? (
      <Text size="xs" c="dimmed" lineClamp={2}>{data.message}</Text>
    ) : (
      <Text size="xs" c="dimmed" fs="italic">No farewell message</Text>
    )}
  </BaseNode>
);

export default EndConversationNode;
