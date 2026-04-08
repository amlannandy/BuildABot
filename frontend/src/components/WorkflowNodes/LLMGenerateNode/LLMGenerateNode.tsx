import { type NodeProps, type Node, useReactFlow } from '@xyflow/react';

import { Textarea } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type LLMGenerateNodeData } from '../types';

type LLMGenerateNodeType = Node<LLMGenerateNodeData, 'llm_generate'>;

const LLMGenerateNode = ({ id, data, selected }: NodeProps<LLMGenerateNodeType>) => {
  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode id={id} title="LLM Generate" color="indigo" icon={<IconSparkles size={14} />} selected={selected}>
      <div className="nodrag">
        <Textarea
          label="Reply template"
          placeholder="e.g. Based on your question, here's what I found: {{response}}"
          description="Optional — leave blank for a free-form AI response"
          size="xs"
          autosize
          minRows={2}
          value={data.replyTemplate ?? ''}
          onChange={(e) => { updateNodeData(id, { replyTemplate: e.currentTarget.value }); }}
        />
      </div>
    </BaseNode>
  );
};

export default LLMGenerateNode;
