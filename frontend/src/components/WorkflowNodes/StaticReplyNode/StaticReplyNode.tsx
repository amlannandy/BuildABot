import { useReactFlow, type Node } from '@xyflow/react';

import { Stack, TextInput } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type StaticReplyNodeData } from '../types';

type StaticReplyNodeTypeProps = Node<StaticReplyNodeData, 'static_reply'>;

const StaticReplyNode: React.FC<StaticReplyNodeTypeProps> = ({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode
      title="Static Reply"
      color="green"
      icon={<IconMessage size={14} />}
      selected={selected}
    >
      <Stack gap="xs" className="nodrag">
        <TextInput
          label="Intent"
          placeholder="e.g. greet_user"
          description="The intent that triggers this node"
          size="xs"
          value={data.intent}
          onChange={(e) => {
            updateNodeData(id, { intent: e.currentTarget.value });
          }}
        />
        <TextInput
          label="Message"
          placeholder="e.g. Hello! How can I help?"
          description="Fixed message returned to the user"
          size="xs"
          value={data.message}
          onChange={(e) => {
            updateNodeData(id, { message: e.currentTarget.value });
          }}
        />
      </Stack>
    </BaseNode>
  );
};

export default StaticReplyNode;
