import { useParams } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconPlugConnected, IconSitemap } from '@tabler/icons-react';

import ChatFlow from '@components/ChatFlow';
import SecretKeyField from '@components/SecretKeyField';
import { ROUTES } from '@constants/routes';
import { useGetChatBot } from '@hooks/chatbots/useGetChatBot';
import useSafeNavigate from '@hooks/useSafeNavigate';

import ChatbotNotFound from './ChatbotNotFound';

const ChatbotDetails = () => {
  const { id } = useParams<{ id: string }>();
  const chatbotId = Number(id);
  const { data, isLoading, isError } = useGetChatBot(chatbotId);
  const { safeNavigate } = useSafeNavigate();
  const chatbot = data?.data;

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (!chatbot || isError) {
    return <ChatbotNotFound />;
  }

  const hasWorkflow = !!chatbot.workflow;

  return (
    <Stack gap="lg" maw={1200} mx="auto">
      <Box>
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => {
            safeNavigate(ROUTES.HOME);
          }}
        >
          Back
        </Button>
      </Box>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* Left column */}
        <Stack gap="lg">
          <Box>
            <Title order={2}>{chatbot.name}</Title>
            {chatbot.description ? (
              <Text c="dimmed" size="sm" mt={4}>
                {chatbot.description}
              </Text>
            ) : (
              <Text c="dimmed" size="sm" mt={4} fs="italic">
                No description provided.
              </Text>
            )}
          </Box>
          <Card withBorder radius="md" padding="lg">
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconSitemap size={18} />
                  <Text fw={600} size="sm">
                    Workflow
                  </Text>
                </Group>
                <Button
                  size="xs"
                  variant={hasWorkflow ? 'default' : 'filled'}
                  leftSection={<IconSitemap size={14} />}
                  onClick={() => {
                    safeNavigate(ROUTES.CHATBOT_WORKFLOW.replace(':id', chatbotId.toString()));
                  }}
                >
                  {hasWorkflow ? 'Edit Workflow' : 'Configure Workflow'}
                </Button>
              </Group>
              <Divider />
              <Group gap="xs">
                <IconPlugConnected size={18} />
                <Text fw={600} size="sm">
                  Integrations
                </Text>
              </Group>
              <SecretKeyField label="API Key" value={chatbot.api_key} />
            </Stack>
          </Card>
        </Stack>
        {/* Right column */}
        <ChatFlow chatId={chatbotId} isWorkflowConfigured={hasWorkflow} />
      </SimpleGrid>
    </Stack>
  );
};

export default ChatbotDetails;
