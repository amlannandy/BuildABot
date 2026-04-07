import { useEffect, useRef, useState } from 'react';

import { v4 } from 'uuid';

import { ActionIcon, Badge, Box, Card, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMessageCircle, IconSend } from '@tabler/icons-react';

import { useSendMessage } from '@hooks/chatbots/useSendMessage';
import useSafeNavigate from '@hooks/useSafeNavigate';

import EmptyState from './EmptyState';
import { useChatFlowStore, type ChatMessage } from './state';
import styles from './styles.module.scss';

interface ChatFlowProps {
  chatId: number;
  chatBotName: string;
  isWorkflowConfigured: boolean;
}

const CURRENT_USER_IDENTIFIER = v4();

const ChatFlow: React.FC<ChatFlowProps> = ({ chatId, chatBotName, isWorkflowConfigured }) => {
  const { safeNavigate } = useSafeNavigate();
  const [message, setMessage] = useState('');
  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();
  const { messages, addMessage, removeMessage } = useChatFlowStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (isSendingMessage) return;
    const userMessageId = v4();
    const userMessage: ChatMessage = {
      id: userMessageId,
      text: message,
      sender: 'user',
    };
    setMessage('');
    addMessage(userMessage);
    sendMessage(
      {
        chatbotId: chatId,
        message,
        userIdentifier: CURRENT_USER_IDENTIFIER,
      },
      {
        onSuccess: (response) => {
          const botReply: ChatMessage = {
            id: v4(),
            text: response.data.reply,
            sender: 'bot',
          };
          addMessage(botReply);
        },
        onError: () => {
          removeMessage(userMessageId);
          notifications.show({
            message: 'Failed to send message',
            color: 'red',
          });
        },
      },
    );
  };

  const handleConfigureWorkflow = () => {
    safeNavigate(`/chatbots/${chatId.toString()}/workflow`);
  };

  if (!isWorkflowConfigured) {
    return <EmptyState onConfigureWorkflow={handleConfigureWorkflow} />;
  }

  return (
    <Card withBorder radius="md" className={styles.card}>
      <Stack h="100%" gap={0}>
        <Group px="md" py="sm" className={styles.header}>
          <IconMessageCircle size={18} />
          <Text fw={600} size="sm">
            {chatBotName}
          </Text>
          <Badge size="xs" color="green" variant="dot">
            Active
          </Badge>
        </Group>
        <Stack flex={1} px="md" py="sm" gap="sm" className={styles.messages}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              className={`${styles.bubble} ${msg.sender === 'user' ? styles.outgoing : styles.incoming}`}
            >
              <Text size="sm">{msg.text}</Text>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Box px="md" py="sm" className={styles.input}>
          <TextInput
            placeholder="Type a message..."
            radius="xl"
            value={message}
            readOnly={isSendingMessage}
            onChange={(e) => {
              setMessage(e.currentTarget.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rightSection={
              <ActionIcon radius="xl" onClick={handleSendMessage} loading={isSendingMessage}>
                <IconSend size={16} />
              </ActionIcon>
            }
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default ChatFlow;
