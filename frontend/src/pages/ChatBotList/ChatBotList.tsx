import { useState } from 'react';

import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDots, IconEdit, IconPlus, IconRobot, IconTrash } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import { ROUTES } from '@constants/routes';
import type { ApiErrorResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';
import { useDeleteChatBot } from '@hooks/chatbots/useDeleteChatBot';
import { useListChatBots } from '@hooks/chatbots/useListChatBots';
import useSafeNavigate from '@hooks/useSafeNavigate';
import CreateChatBotModal from '@pages/ChatBotList/CreateChatBotModal/CreateChatBotModal';

import styles from './styles.module.scss';

const PAGE_LIMIT = 12;

const ChatBotList = () => {
  const [page, setPage] = useState(1);
  const [selectedChatBot, setSelectedChatBot] = useState<ChatBot | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { safeNavigate } = useSafeNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListChatBots({ page, limit: PAGE_LIMIT, filters: {} });
  const { mutate: deleteChatBot, isPending: isDeleting } = useDeleteChatBot();

  const chatbots: ChatBot[] = data?.data ?? [];

  const handleCreateModalOpen = (chatbot: ChatBot | null) => {
    setSelectedChatBot(chatbot);
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setSelectedChatBot(null);
    setIsCreateModalOpen(false);
  };

  const handleDeleteModalOpen = (chatbot: ChatBot) => {
    setSelectedChatBot(chatbot);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setSelectedChatBot(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedChatBot) return;
    deleteChatBot(selectedChatBot.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.LIST_CHATBOTS] });
        notifications.show({
          title: 'Chatbot deleted',
          message: `${selectedChatBot.name} has been deleted.`,
          color: 'green',
        });
        handleDeleteModalClose();
      },
      onError: (error: ApiErrorResponse) => {
        notifications.show({
          title: 'Delete failed',
          message: error.errors[0] ?? 'Something went wrong',
          color: 'red',
        });
        setSelectedChatBot(null);
      },
    });
  };

  const goToChatBotDetails = (chatbotId: number) => {
    safeNavigate(ROUTES.CHATBOT_DETAILS.replace(':id', chatbotId.toString()));
  };

  return (
    <>
      <Stack gap="lg" mx="auto">
        <Group justify="flex-start">
          <Button
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              handleCreateModalOpen(null);
            }}
          >
            New Chatbot
          </Button>
        </Group>

        {isLoading ? (
          <Center py={80}>
            <Loader />
          </Center>
        ) : chatbots.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="sm">
              <Avatar size={56} radius="xl" color="gray" variant="light">
                <IconRobot size={28} />
              </Avatar>
              <Text fw={500}>No chatbots yet</Text>
              <Text size="sm" c="dimmed">
                Create your first bot to get started
              </Text>
              <Button
                size="xs"
                leftSection={<IconPlus size={14} />}
                mt="xs"
                onClick={() => {
                  handleCreateModalOpen(null);
                }}
              >
                New Chatbot
              </Button>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {chatbots.map((chatbot) => (
              <Card
                key={chatbot.id}
                withBorder
                radius="md"
                padding="md"
                className={styles.chatbotCard}
                onClick={() => {
                  goToChatBotDetails(chatbot.id);
                }}
              >
                <Box
                  className={styles.cardMenu}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Menu shadow="md" width={160} position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <IconDots size={15} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => {
                          handleCreateModalOpen(chatbot);
                        }}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => {
                          handleDeleteModalOpen(chatbot);
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Box>

                <Stack gap="sm">
                  <Avatar size={40} radius="md" color="blue" variant="light">
                    <IconRobot size={22} />
                  </Avatar>
                  <Box>
                    <Text fw={600} size="sm" lineClamp={1}>
                      {chatbot.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                      {chatbot.description || 'No description'}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {(data?.pagination.total ?? 0) > PAGE_LIMIT && (
          <Group justify="center">
            <Pagination
              total={Math.ceil((data?.pagination.total ?? 0) / PAGE_LIMIT)}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        )}
      </Stack>

      <CreateChatBotModal
        opened={isCreateModalOpen}
        chatbot={selectedChatBot}
        onClose={handleCreateModalClose}
      />
      <Modal
        opened={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        title="Delete chatbot"
        size="sm"
      >
        <Text size="sm">
          Are you sure you want to delete <strong>{selectedChatBot?.name}</strong>? This action
          cannot be undone.
        </Text>
        <Group justify="flex-end" mt="xl" gap="sm">
          <Button variant="default" size="xs" onClick={handleDeleteModalClose}>
            Cancel
          </Button>
          <Button color="red" size="xs" loading={isDeleting} onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default ChatBotList;
