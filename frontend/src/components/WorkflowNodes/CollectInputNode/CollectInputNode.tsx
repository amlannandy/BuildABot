import { type NodeProps, type Node } from '@xyflow/react';

import { Badge, Group, Stack, Text } from '@mantine/core';
import { IconForms } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type CollectInputNodeData } from '../types';

type CollectInputNodeType = Node<CollectInputNodeData, 'collect_input'>;

const CollectInputNode = ({ data, selected }: NodeProps<CollectInputNodeType>) => (
  <BaseNode title="Collect Input" color="violet" icon={<IconForms size={14} />} selected={selected}>
    <Stack gap={4}>
      <Text size="xs" c="dimmed" lineClamp={2}>{data.prompt || <Text span fs="italic">No prompt set</Text>}</Text>
      <Group gap={4}>
        <Text size="xs" c="dimmed">Saves to:</Text>
        <Badge size="xs" variant="light" color="violet" tt="none">
          {`{{${data.variable || '?'}}}`}
        </Badge>
      </Group>
    </Stack>
  </BaseNode>
);

export default CollectInputNode;
