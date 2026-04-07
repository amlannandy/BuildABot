import { type ReactNode } from 'react';

import { Box, Divider, Stack, Text, UnstyledButton } from '@mantine/core';
import {
  IconApi,
  IconDatabase,
  IconForms,
  IconMessage,
  IconPlayerStop,
  IconSparkles,
} from '@tabler/icons-react';

import styles from './styles.module.scss';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  color: string;
  icon: ReactNode;
}

const PALETTE: PaletteItem[] = [
  {
    type: 'static_reply',
    label: 'Static Reply',
    description: 'Send a fixed message to the user',
    color: 'green',
    icon: <IconMessage size={18} />,
  },
  {
    type: 'collect_input',
    label: 'Collect Input',
    description: 'Ask the user a question and save their answer',
    color: 'violet',
    icon: <IconForms size={18} />,
  },
  {
    type: 'api_call',
    label: 'API Call',
    description: 'Fetch data from an external endpoint',
    color: 'orange',
    icon: <IconApi size={18} />,
  },
  {
    type: 'knowledge_base',
    label: 'Knowledge Base',
    description: 'Search your knowledge base for an answer',
    color: 'teal',
    icon: <IconDatabase size={18} />,
  },
  {
    type: 'llm_generate',
    label: 'LLM Generate',
    description: 'Generate a free-form AI response',
    color: 'indigo',
    icon: <IconSparkles size={18} />,
  },
  {
    type: 'end_conversation',
    label: 'End Conversation',
    description: 'Close the session with an optional message',
    color: 'red',
    icon: <IconPlayerStop size={18} />,
  },
];

const NodePanel = () => {
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box className={styles.panel}>
      <Box className={styles.heading}>
        <Text size="sm" fw={700}>
          Nodes
        </Text>
        <Text size="xs" c="dimmed">
          Drag onto the canvas
        </Text>
      </Box>
      <Divider />
      <Stack gap={0} p="sm">
        {PALETTE.map(({ type, label, description, color, icon }, index) => (
          <>
            {index > 0 && <Divider my="xs" />}
            <UnstyledButton
              key={type}
              className={styles.tile}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
            >
              <Box
                className={styles.iconWrap}
                style={{
                  background: `var(--mantine-color-${color}-9)`,
                  color: `var(--mantine-color-${color}-4)`,
                }}
              >
                {icon}
              </Box>
              <Box className={styles.tileText}>
                <Text size="xs" fw={600} lh={1.3}>
                  {label}
                </Text>
                <Text size="xs" c="dimmed" lh={1.3}>
                  {description}
                </Text>
              </Box>
            </UnstyledButton>
          </>
        ))}
      </Stack>
    </Box>
  );
};

export default NodePanel;
