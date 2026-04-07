import { type NodeProps, type Node, useReactFlow } from '@xyflow/react';

import { Textarea } from '@mantine/core';
import { IconPlayerStop } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type EndConversationNodeData } from '../types';

type EndConversationNodeType = Node<EndConversationNodeData, 'end_conversation'>;

const EndConversationNode = ({ id, data, selected }: NodeProps<EndConversationNodeType>) => {
  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode title="End Conversation" color="red" icon={<IconPlayerStop size={14} />} hasOutput={false} selected={selected}>
      <div className="nodrag">
        <Textarea
          label="Farewell message"
          placeholder="e.g. Thanks for chatting! Goodbye."
          description="Sent to the user when the conversation ends"
          size="xs"
          autosize
          minRows={2}
          value={data.message ?? ''}
          onChange={(e) => { updateNodeData(id, { message: e.currentTarget.value }); }}
        />
      </div>
    </BaseNode>
  );
};

export default EndConversationNode;
