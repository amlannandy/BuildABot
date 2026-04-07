import { type NodeProps, type Node } from '@xyflow/react';

import { Badge, Group, Text } from '@mantine/core';
import { IconApi } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type ApiCallNodeData } from '../types';

type ApiCallNodeType = Node<ApiCallNodeData, 'api_call'>;

const ApiCallNode = ({ data, selected }: NodeProps<ApiCallNodeType>) => (
  <BaseNode title="API Call" color="orange" icon={<IconApi size={14} />} selected={selected}>
    <Group gap="xs" wrap="nowrap">
      <Badge size="xs" color="orange" variant="filled" style={{ flexShrink: 0 }}>
        {data.method || 'GET'}
      </Badge>
      <Text size="xs" c="dimmed" truncate="end" style={{ minWidth: 0 }}>
        {data.endpoint || 'No endpoint set'}
      </Text>
    </Group>
  </BaseNode>
);

export default ApiCallNode;
