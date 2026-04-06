import { Badge, Box, Card, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';

import useSafeNavigate from '@hooks/useSafeNavigate';

import EmptyState from './EmptyState';
import styles from './styles.module.scss';

interface ChatFlowProps {
  chatId: number;
  isWorkflowConfigured: boolean;
}

const ChatFlow = ({ chatId, isWorkflowConfigured }: ChatFlowProps) => {
  const { safeNavigate } = useSafeNavigate();

  const handleConfigureWorkflow = () => {
    safeNavigate(`/chatbots/${chatId.toString()}/workflow`);
  };

  if (!isWorkflowConfigured) {
    return <EmptyState onConfigureWorkflow={handleConfigureWorkflow} />;
  }

  return (
    <Card withBorder radius="md" h="100%" className={styles.card}>
      <Stack h="100%" gap={0}>
        <Group px="md" py="sm" className={styles.header}>
          <IconMessageCircle size={18} />
          <Text fw={600} size="sm">
            Chat Preview
          </Text>
          <Badge size="xs" color="green" variant="dot">
            Active
          </Badge>
        </Group>
        <Stack flex={1} px="md" py="sm" gap="sm" className={styles.messages}>
          <Box className={`${styles.bubble} ${styles.incoming}`}>
            <Text size="sm">Hello! How can I help you today?</Text>
          </Box>
          <Box className={`${styles.bubble} ${styles.outgoing}`}>
            <Text size="sm">Tell me about your features.</Text>
          </Box>
          <Box className={`${styles.bubble} ${styles.incoming}`}>
            <Text size="sm">
              I'm a chatbot built with BuildABot. I can answer questions, guide users through
              workflows, and more!
            </Text>
          </Box>
        </Stack>
        <Box px="md" py="sm" className={styles.input}>
          <TextInput placeholder="Type a message..." radius="xl" disabled />
        </Box>
      </Stack>
    </Card>
  );
};

export default ChatFlow;
