import { useEffect, useRef, useState } from 'react';

import { v4 } from 'uuid';

import { ActionIcon, Badge, Box, Card, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMessageCircle, IconSend } from '@tabler/icons-react';

import { useSendMessage } from '@hooks/chatbots/useSendMessage';

import EmptyState from './EmptyState';
import { useChatFlowStore, type ChatMessage } from './state';
import styles from './styles.module.scss';

interface ChatFlowProps {
  chatId: number;
  chatBotName: string;
  isWorkflowConfigured: boolean;
  handleConfigureWorkflow: () => void;
}

const CURRENT_USER_IDENTIFIER = v4();

const ChatFlow: React.FC<ChatFlowProps> = ({
  chatId,
  chatBotName,
  isWorkflowConfigured,
  handleConfigureWorkflow,
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();

  const messages = useChatFlowStore((state) => state.messages);
  const addMessage = useChatFlowStore((state) => state.addMessage);
  const removeMessage = useChatFlowStore((state) => state.removeMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSendingMessage]);

  const handleSendMessage = () => {
    if (isSendingMessage || !message.trim()) return;
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

  if (!isWorkflowConfigured) {
    return <EmptyState onConfigureWorkflow={handleConfigureWorkflow} />;
  }

  return (
    <Card withBorder radius="md" className={styles.card}>
      <Stack h="100%" gap={0}>
        <Group px="md" py="xs" className={styles.header}>
          <IconMessageCircle size={16} />
          <Text fw={600} size="sm" flex={1}>
            {chatBotName}
          </Text>
          <Badge size="xs" color="green" variant="dot">
            Active
          </Badge>
        </Group>

        <Box className={styles.messages}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              className={`${styles.bubble} ${msg.sender === 'user' ? styles.outgoing : styles.incoming}`}
            >
              <Text size="sm" c={msg.sender === 'user' ? 'white' : undefined}>
                {msg.text}
              </Text>
            </Box>
          ))}
          {isSendingMessage && (
            <Box className={styles.typingBubble}>
              <Box className={styles.typingDot} />
              <Box className={styles.typingDot} />
              <Box className={styles.typingDot} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box className={styles.input}>
          <TextInput
            placeholder="Type a message..."
            radius="xl"
            size="sm"
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
              <ActionIcon
                radius="xl"
                size="sm"
                onClick={handleSendMessage}
                loading={isSendingMessage}
                disabled={!message.trim()}
              >
                <IconSend size={14} />
              </ActionIcon>
            }
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default ChatFlow;
