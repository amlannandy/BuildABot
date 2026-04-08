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
      <Center flex={1} h="100%">
        <Stack align="center" gap="md" maw={280}>
          <Box className={styles.emptyIconCircle}>
            <IconSitemap size={32} color="var(--mantine-color-blue-3)" />
          </Box>
          <Stack align="center" gap={6}>
            <Text fw={600} size="sm">
              No workflow configured
            </Text>
            <Text size="xs" c="dimmed" ta="center" lh={1.6}>
              Configure a workflow to define how your chatbot handles conversations.
            </Text>
          </Stack>
          <Button
            size="xs"
            leftSection={<IconSitemap size={14} />}
            onClick={onConfigureWorkflow}
          >
            Configure Workflow
          </Button>
        </Stack>
      </Center>
    </Card>
  );
};

export default EmptyState;
