import { type ReactNode } from 'react';

import { Handle, Position, useReactFlow } from '@xyflow/react';

import { ActionIcon, Box, Group, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import styles from './styles.module.scss';

export interface BaseNodeProps {
  id: string;
  title: string;
  color: string;
  icon: ReactNode;
  children?: ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  selected?: boolean;
}

const BaseNode = ({
  id,
  title,
  color,
  icon,
  children,
  hasInput = true,
  hasOutput = true,
  selected = false,
}: BaseNodeProps) => {
  const { deleteElements } = useReactFlow();

  return (
    <Box className={`${styles.node} ${selected ? styles.selected : ''}`}>
      {hasInput && <Handle type="target" position={Position.Left} className={styles.handle} />}

      <Box className={styles.header} style={{ borderColor: `var(--mantine-color-${color}-6)` }}>
        <Group gap="xs" justify="space-between">
          <Group gap="xs">
            <Box className={styles.iconWrap} style={{ color: `var(--mantine-color-${color}-5)` }}>
              {icon}
            </Box>
            <Text size="xs" fw={600} c="white">
              {title}
            </Text>
          </Group>
          <ActionIcon
            size="xs"
            variant="subtle"
            color="red"
            className="nodrag"
            onClick={() => {
              void deleteElements({ nodes: [{ id }] });
            }}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Group>
      </Box>

      {children && (
        <Stack className={styles.body} gap="xs">
          {children}
        </Stack>
      )}

      {hasOutput && <Handle type="source" position={Position.Right} className={styles.handle} />}
    </Box>
  );
};

export default BaseNode;
