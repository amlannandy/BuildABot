import { useState } from 'react';

import { IconEdit, IconExternalLink, IconPlus, IconRobot, IconTrash } from '@tabler/icons-react';

import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import { ROUTES } from '@constants/routes';
import type { ApiErrorResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';
import { useDeleteChatBot } from '@hooks/chatbots/useDeleteChatBot';
import { useListChatBots } from '@hooks/chatbots/useListChatBots';
import useSafeNavigate from '@hooks/useSafeNavigate';
import CreateChatBotModal from '@pages/ChatBotList/CreateChatBotModal/CreateChatBotModal';

const PAGE_LIMIT = 10;

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
        handleCreateModalClose();
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

  const rows = chatbots.map((chatbot) => (
    <Table.Tr key={chatbot.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" radius="xl" color="gray" variant="filled">
            <IconRobot size={14} />
          </Avatar>
          <Text size="sm" fw={500}>
            {chatbot.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td w={320}>
        {chatbot.description ? (
          <Tooltip label={chatbot.description} multiline maw={320} withArrow openDelay={300}>
            <Text size="sm" truncate="end" maw={320}>
              {chatbot.description}
            </Text>
          </Tooltip>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>
      <Table.Td w={100}>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => {
              goToChatBotDetails(chatbot.id);
            }}
          >
            <IconExternalLink size={15} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => {
              handleCreateModalOpen(chatbot);
            }}
          >
            <IconEdit size={15} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => {
              handleDeleteModalOpen(chatbot);
            }}
          >
            <IconTrash size={15} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Stack gap="xl" maw={1200} mx="auto">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2}>Your Chatbots</Title>
            <Text c="dimmed" size="sm" mt={4}>
              {isLoading
                ? 'Loading...'
                : `${chatbots.length.toString()} bot${chatbots.length === 1 ? '' : 's'} configured`}
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              handleCreateModalOpen(null);
            }}
          >
            New Chatbot
          </Button>
        </Group>

        <Card shadow="sm" radius="md" padding={0} withBorder>
          {isLoading ? (
            <Center py={60}>
              <Loader />
            </Center>
          ) : chatbots.length === 0 ? (
            <Center py={60}>
              <Stack align="center" gap="sm">
                <Avatar size={56} radius="xl" color="gray" variant="light">
                  <IconRobot size={28} />
                </Avatar>
                <Text fw={500}>No chatbots yet</Text>
                <Text size="sm" c="dimmed">
                  Create your first bot to get started
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
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
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="xl">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={300}>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th w={100}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          )}
        </Card>

        <Group justify="center">
          <Pagination
            total={Math.ceil((data?.pagination.total ?? 0) / PAGE_LIMIT) || 1}
            value={page}
            onChange={setPage}
            disabled={!data || data.pagination.total <= PAGE_LIMIT}
          />
        </Group>
      </Stack>
      {/* Create ChatBot Modal */}
      <CreateChatBotModal
        opened={isCreateModalOpen}
        chatbot={selectedChatBot}
        onClose={handleCreateModalClose}
      />
      {/* Delete Confirmation Modal */}
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
          <Button variant="default" onClick={handleDeleteModalClose}>
            Cancel
          </Button>
          <Button color="red" loading={isDeleting} onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default ChatBotList;
