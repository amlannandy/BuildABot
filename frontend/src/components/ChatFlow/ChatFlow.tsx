import { IconMessageCircle, IconSitemap } from '@tabler/icons-react';

import { Badge, Box, Button, Card, Center, Group, Stack, Text, TextInput } from '@mantine/core';

import { ROUTES } from '@constants/routes';
import useSafeNavigate from '@hooks/useSafeNavigate';

interface ChatFlowProps {
  chatId: number;
  isWorkflowConfigured: boolean;
}

const ChatFlow = ({ chatId, isWorkflowConfigured }: ChatFlowProps) => {
  const { safeNavigate } = useSafeNavigate();

  if (!isWorkflowConfigured) {
    return (
      <Card withBorder radius="md" style={{ minHeight: 420 }}>
        <Center h="100%" style={{ minHeight: 380 }}>
          <Stack align="center" gap="md" maw={320}>
            <Box
              style={{
                background: 'var(--mantine-color-dark-5)',
                borderRadius: '50%',
                padding: 20,
                display: 'flex',
              }}
            >
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
            <Button
              leftSection={<IconSitemap size={16} />}
              onClick={() => {
                safeNavigate(ROUTES.CHATBOT_WORKFLOW.replace(':id', chatId.toString()));
              }}
            >
              Configure Workflow
            </Button>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" h="100%" style={{ minHeight: 420 }}>
      <Stack h="100%" gap={0}>
        <Group px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
          <IconMessageCircle size={18} />
          <Text fw={600} size="sm">
            Chat Preview
          </Text>
          <Badge size="xs" color="green" variant="dot">
            Active
          </Badge>
        </Group>
        <Stack flex={1} px="md" py="sm" gap="sm" style={{ overflowY: 'auto' }}>
          <Box
            style={{
              alignSelf: 'flex-start',
              background: 'var(--mantine-color-dark-5)',
              borderRadius: 'var(--mantine-radius-md)',
              padding: '8px 12px',
              maxWidth: '75%',
            }}
          >
            <Text size="sm">Hello! How can I help you today?</Text>
          </Box>
          <Box
            style={{
              alignSelf: 'flex-end',
              background: 'var(--mantine-color-gray-7)',
              borderRadius: 'var(--mantine-radius-md)',
              padding: '8px 12px',
              maxWidth: '75%',
            }}
          >
            <Text size="sm">Tell me about your features.</Text>
          </Box>
          <Box
            style={{
              alignSelf: 'flex-start',
              background: 'var(--mantine-color-dark-5)',
              borderRadius: 'var(--mantine-radius-md)',
              padding: '8px 12px',
              maxWidth: '75%',
            }}
          >
            <Text size="sm">
              I'm a chatbot built with BuildABot. I can answer questions, guide users through
              workflows, and more!
            </Text>
          </Box>
        </Stack>
        <Box px="md" py="sm" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
          <TextInput placeholder="Type a message..." radius="xl" disabled />
        </Box>
      </Stack>
    </Card>
  );
};

export default ChatFlow;
