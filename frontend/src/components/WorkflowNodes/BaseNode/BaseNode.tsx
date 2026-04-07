import { type ReactNode } from 'react';

import { Handle, Position } from '@xyflow/react';

import { Box, Group, Stack, Text } from '@mantine/core';

import styles from './styles.module.scss';

export interface BaseNodeProps {
  title: string;
  color: string;
  icon: ReactNode;
  children?: ReactNode;
  hasInput?: boolean;
  hasOutput?: boolean;
  selected?: boolean;
}

const BaseNode = ({
  title,
  color,
  icon,
  children,
  hasInput = true,
  hasOutput = true,
  selected = false,
}: BaseNodeProps) => {
  return (
    <Box className={`${styles.node} ${selected ? styles.selected : ''}`}>
      {hasInput && <Handle type="target" position={Position.Left} className={styles.handle} />}

      <Box className={styles.header} style={{ borderColor: `var(--mantine-color-${color}-6)` }}>
        <Group gap="xs">
          <Box className={styles.iconWrap} style={{ color: `var(--mantine-color-${color}-5)` }}>
            {icon}
          </Box>
          <Text size="xs" fw={600} c="white">
            {title}
          </Text>
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
