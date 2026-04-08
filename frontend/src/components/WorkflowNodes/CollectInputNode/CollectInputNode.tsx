import { type NodeProps, type Node, useReactFlow } from '@xyflow/react';

import { Stack, TextInput, Textarea } from '@mantine/core';
import { IconForms } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type CollectInputNodeData } from '../types';

import styles from './styles.module.scss';

type CollectInputNodeType = Node<CollectInputNodeData, 'collect_input'>;

const CollectInputNode = ({ id, data, selected }: NodeProps<CollectInputNodeType>) => {
  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode
      id={id}
      title="Collect Input"
      color="violet"
      icon={<IconForms size={14} />}
      selected={selected}
    >
      <Stack gap="xs" className="nodrag">
        <TextInput
          label="Intent"
          placeholder="e.g. order_status"
          description="The intent that triggers this flow"
          size="xs"
          value={data.intent ?? ''}
          onChange={(e) => {
            updateNodeData(id, { intent: e.currentTarget.value });
          }}
        />
        <Textarea
          label="Prompt"
          placeholder="e.g. What is your order ID?"
          description="Message sent to the user"
          size="xs"
          autosize
          minRows={2}
          value={data.prompt}
          onChange={(e) => {
            updateNodeData(id, { prompt: e.currentTarget.value });
          }}
        />
        <TextInput
          label="Save as"
          placeholder="e.g. order_id"
          description="Variable name to store the response"
          size="xs"
          leftSection={<span className={styles.varBrace}>{'{' + '{'}</span>}
          rightSection={<span className={styles.varBrace}>{'}' + '}'}</span>}
          value={data.variable}
          onChange={(e) => {
            updateNodeData(id, { variable: e.currentTarget.value });
          }}
        />
      </Stack>
    </BaseNode>
  );
};

export default CollectInputNode;
