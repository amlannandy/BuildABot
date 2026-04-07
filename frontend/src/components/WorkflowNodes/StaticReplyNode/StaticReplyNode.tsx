import { type NodeProps, type Node } from '@xyflow/react';

import { Text } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type StaticReplyNodeData } from '../types';

type StaticReplyNodeType = Node<StaticReplyNodeData, 'static_reply'>;

const StaticReplyNode = ({ data, selected }: NodeProps<StaticReplyNodeType>) => (
  <BaseNode title="Static Reply" color="green" icon={<IconMessage size={14} />} selected={selected}>
    {data.message ? (
      <Text size="xs" c="dimmed" lineClamp={2}>{data.message}</Text>
    ) : (
      <Text size="xs" c="dimmed" fs="italic">No message set</Text>
    )}
  </BaseNode>
);

export default StaticReplyNode;
