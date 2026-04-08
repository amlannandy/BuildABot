import { useState } from 'react';

import { type NodeProps, type Node, useReactFlow } from '@xyflow/react';

import { Combobox, InputBase, Stack, TextInput, useCombobox } from '@mantine/core';
import { IconDatabase, IconPlus } from '@tabler/icons-react';

import { useListKnowledgeBases } from '@hooks/knowledgeBases/useListKnowledgeBases';

import BaseNode from '../BaseNode';
import { type KnowledgeBaseNodeData } from '../types';

type KnowledgeBaseNodeType = Node<KnowledgeBaseNodeData, 'knowledge_base'>;

const UPLOAD_VALUE = '__upload__';

const KnowledgeBaseNode = ({ id, data, selected }: NodeProps<KnowledgeBaseNodeType>) => {
  const { updateNodeData } = useReactFlow();
  const [search, setSearch] = useState('');
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
    },
  });

  const { data: kbData } = useListKnowledgeBases(data.chatbotId, search || undefined);
  const kbs = kbData?.data ?? [];

  const handleSelect = (value: string) => {
    if (value === UPLOAD_VALUE) {
      combobox.closeDropdown();
      return;
    }
    const kb = kbs.find((k) => String(k.id) === value);
    if (kb) {
      updateNodeData(id, { kbId: kb.id, kbName: kb.name });
    }
    combobox.closeDropdown();
  };

  return (
    <BaseNode
      title="Knowledge Base"
      color="teal"
      icon={<IconDatabase size={14} />}
      selected={selected}
    >
      <Stack gap="xs" className="nodrag">
        <TextInput
          label="Intent"
          placeholder="e.g. return_policy_question"
          description="The intent that triggers this node"
          size="xs"
          value={data.intent ?? ''}
          onChange={(e) => {
            updateNodeData(id, { intent: e.currentTarget.value });
          }}
        />

        <Combobox store={combobox} onOptionSubmit={handleSelect}>
          <Combobox.Target>
            <InputBase
              label="Knowledge base"
              description="Select a knowledge base to query"
              placeholder="Search knowledge bases..."
              size="xs"
              rightSection={<Combobox.Chevron />}
              rightSectionPointerEvents="none"
              value={combobox.dropdownOpened ? search : (data.kbName ?? '')}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                combobox.openDropdown();
              }}
              onClick={() => {
                combobox.openDropdown();
              }}
              onFocus={() => {
                combobox.openDropdown();
              }}
              onBlur={() => {
                combobox.closeDropdown();
                setSearch('');
              }}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>
              {kbs.length === 0 && <Combobox.Empty>No knowledge bases found</Combobox.Empty>}
              {kbs.map((kb) => (
                <Combobox.Option key={kb.id} value={String(kb.id)}>
                  {kb.name}
                </Combobox.Option>
              ))}
              <Combobox.Option
                value={UPLOAD_VALUE}
                style={{ color: 'var(--mantine-color-teal-5)' }}
              >
                <Stack gap={2} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconPlus size={12} />
                  Upload new knowledge base
                </Stack>
              </Combobox.Option>
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </Stack>
    </BaseNode>
  );
};

export default KnowledgeBaseNode;
