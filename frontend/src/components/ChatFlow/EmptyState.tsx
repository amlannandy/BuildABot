import type React from 'react';

import { Box, Button, Card, Center, Stack, Text } from '@mantine/core';
import { IconSitemap } from '@tabler/icons-react';

import styles from './styles.module.scss';

interface EmptyStateProps {
  onConfigureWorkflow: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onConfigureWorkflow }) => {
  return (
    <Card withBorder radius="md" className={styles.emptyCard}>
      <Center h="100%" className={styles.emptyCenter}>
        <Stack align="center" gap="md" maw={320}>
          <Box className={styles.emptyIconCircle}>
            <IconSitemap size={36} color="var(--mantine-color-gray-5)" />
          </Box>
          <Stack align="center" gap={4}>
            <Text fw={600} size="md">
              No workflow configured
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Set up a workflow to define how your chatbot handles conversations and routes user
              requests.
            </Text>
          </Stack>
          <Button leftSection={<IconSitemap size={16} />} onClick={onConfigureWorkflow}>
            Configure Workflow
          </Button>
        </Stack>
      </Center>
    </Card>
  );
};

export default EmptyState;
