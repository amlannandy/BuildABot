import { useParams } from 'react-router-dom';

import {
  ActionIcon,
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
} from '@mantine/core';
import { IconArrowLeft, IconInfoCircle, IconPlugConnected, IconSitemap } from '@tabler/icons-react';

import ChatFlow from '@components/ChatFlow';
import SecretKeyField from '@components/SecretKeyField';
import { ROUTES } from '@constants/routes';
import { useGetChatBot } from '@hooks/chatbots/useGetChatBot';
import useSafeNavigate from '@hooks/useSafeNavigate';

import ChatbotNotFound from './ChatbotNotFound';
import styles from './styles.module.scss';

const ChatbotDetails = () => {
  const { id } = useParams<{ id: string }>();
  const chatbotId = Number(id);
  const { data, isLoading, isError } = useGetChatBot(chatbotId);
  const { safeNavigate } = useSafeNavigate();
  const chatbot = data?.data;

  const openWorkflowBuilder = () => {
    safeNavigate(ROUTES.WORKFLOW_BUILDER.replace(':id', chatbotId.toString()));
  };

  if (isLoading) {
    return (
      <Center h="calc(100vh - 60px)">
        <Loader />
      </Center>
    );
  }

  if (!chatbot || isError) {
    return <ChatbotNotFound />;
  }

  const hasWorkflow = !!chatbot.workflow;

  return (
    <Box className={styles.page}>
      <Box className={styles.header}>
        <Group justify="space-between" h="100%" px="md">
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => {
                safeNavigate(ROUTES.HOME);
              }}
            >
              <IconArrowLeft size={18} />
            </ActionIcon>
            <Text fw={600} size="sm">
              {chatbot.name}
            </Text>
          </Group>
          <Button
            size="xs"
            variant={hasWorkflow ? 'default' : 'filled'}
            leftSection={<IconSitemap size={14} />}
            onClick={openWorkflowBuilder}
          >
            {hasWorkflow ? 'Edit Workflow' : 'Configure Workflow'}
          </Button>
        </Group>
      </Box>

      <Box className={styles.body}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mx="auto">
          <Stack gap="md">
            <Card withBorder radius="md" padding="lg">
              <Stack gap="md">
                <Group gap="xs">
                  <IconInfoCircle size={16} />
                  <Text fw={600} size="sm">
                    About
                  </Text>
                </Group>
                {chatbot.description ? (
                  <Text size="sm">{chatbot.description}</Text>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    No description provided.
                  </Text>
                )}
                <Divider />
                <Group gap="xs">
                  <IconPlugConnected size={16} />
                  <Text fw={600} size="sm">
                    Integrations
                  </Text>
                </Group>
                <SecretKeyField label="API Key" value={chatbot.api_key} />
              </Stack>
            </Card>
          </Stack>
          <ChatFlow
            chatId={chatbotId}
            chatBotName={chatbot.name}
            isWorkflowConfigured={hasWorkflow}
            handleConfigureWorkflow={openWorkflowBuilder}
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default ChatbotDetails;
