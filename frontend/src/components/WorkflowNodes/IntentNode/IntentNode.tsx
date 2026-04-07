import { type NodeProps, type Node } from '@xyflow/react';

import { Badge, Text } from '@mantine/core';
import { IconBolt } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type IntentNodeData } from '../types';

type IntentNodeType = Node<IntentNodeData, 'intent'>;

const IntentNode = ({ data, selected }: NodeProps<IntentNodeType>) => (
  <BaseNode title="Intent" color="blue" icon={<IconBolt size={14} />} hasInput={false} selected={selected}>
    {data.intent ? (
      <Badge size="sm" variant="light" color="blue" tt="none">
        {data.intent}
      </Badge>
    ) : (
      <Text size="xs" c="dimmed" fs="italic">No intent set</Text>
    )}
  </BaseNode>
);

export default IntentNode;
