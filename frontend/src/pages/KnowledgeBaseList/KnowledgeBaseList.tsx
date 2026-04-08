import { useState } from 'react';

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBook2, IconDots, IconPlus, IconTrash } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import type { ApiErrorResponse } from '@dto/api';
import type { KnowledgeBase } from '@dto/knowledgeBase';
import { useListChatBots } from '@hooks/chatbots/useListChatBots';
import { useDeleteKnowledgeBase } from '@hooks/knowledgeBases/useDeleteKnowledgeBase';
import { useListKnowledgeBases } from '@hooks/knowledgeBases/useListKnowledgeBases';

import CreateKnowledgeBaseModal from './CreateKnowledgeBaseModal';
import styles from './styles.module.scss';

const PAGE_LIMIT = 12;

const KnowledgeBaseList = () => {
  const [page, setPage] = useState(1);
  const [selectedChatbotId, setSelectedChatbotId] = useState<number | null>(null);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: chatbotsData, isLoading: isChatbotsLoading } = useListChatBots({
    page: 1,
    limit: 100,
    filters: {},
  });
  const { data, isLoading: isKbsLoading } = useListKnowledgeBases(
    selectedChatbotId ?? 0,
    undefined,
    page,
    PAGE_LIMIT,
  );
  const { mutate: deleteKnowledgeBase, isPending: isDeleting } = useDeleteKnowledgeBase();

  const chatbots = chatbotsData?.data ?? [];
  const kbs: KnowledgeBase[] = data?.data ?? [];

  const chatbotOptions = chatbots.map((cb) => ({
    value: String(cb.id),
    label: cb.name,
  }));

  const handleDeleteModalOpen = (kb: KnowledgeBase) => {
    setSelectedKb(kb);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setSelectedKb(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!selectedKb) return;
    deleteKnowledgeBase(selectedKb.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.LIST_KNOWLEDGE_BASES] });
        notifications.show({
          title: 'Knowledge base deleted',
          message: `${selectedKb.name} has been deleted.`,
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
        setSelectedKb(null);
      },
    });
  };

  return (
    <>
      <Stack gap="lg" mx="auto">
        <Group justify="space-between">
          <Select
            placeholder="Select a chatbot"
            data={chatbotOptions}
            value={selectedChatbotId ? String(selectedChatbotId) : null}
            onChange={(val) => {
              setSelectedChatbotId(val ? Number(val) : null);
              setPage(1);
            }}
            disabled={isChatbotsLoading}
            clearable
            size="xs"
            w={220}
          />
          {selectedChatbotId && (
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
            >
              New Knowledge Base
            </Button>
          )}
        </Group>

        {!selectedChatbotId ? (
          <Center py={80}>
            <Stack align="center" gap="sm">
              <Avatar size={56} radius="xl" color="gray" variant="light">
                <IconBook2 size={28} />
              </Avatar>
              <Text fw={500}>Select a chatbot</Text>
              <Text size="sm" c="dimmed">
                Choose a chatbot above to view its knowledge bases
              </Text>
            </Stack>
          </Center>
        ) : isKbsLoading ? (
          <Center py={80}>
            <Loader />
          </Center>
        ) : kbs.length === 0 ? (
          <Center py={80}>
            <Stack align="center" gap="sm">
              <Avatar size={56} radius="xl" color="gray" variant="light">
                <IconBook2 size={28} />
              </Avatar>
              <Text fw={500}>No knowledge bases yet</Text>
              <Text size="sm" c="dimmed">
                Upload a file to create your first knowledge base
              </Text>
              <Button
                size="xs"
                leftSection={<IconPlus size={14} />}
                mt="xs"
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
              >
                New Knowledge Base
              </Button>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {kbs.map((kb) => (
              <Card key={kb.id} withBorder radius="md" padding="md" className={styles.kbCard}>
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
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => {
                          handleDeleteModalOpen(kb);
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Box>

                <Stack gap="sm">
                  <Avatar size={40} radius="md" color="teal" variant="light">
                    <IconBook2 size={22} />
                  </Avatar>
                  <Box>
                    <Text fw={600} size="sm" lineClamp={1}>
                      {kb.name}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                      {kb.file_name}
                    </Text>
                    <Badge size="xs" variant="light" color="gray" mt={6}>
                      {kb.file_type.toUpperCase()}
                    </Badge>
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

      {selectedChatbotId && (
        <CreateKnowledgeBaseModal
          opened={isCreateModalOpen}
          chatbotId={selectedChatbotId}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
        />
      )}

      <Modal
        opened={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        title="Delete knowledge base"
        size="sm"
      >
        <Text size="sm">
          Are you sure you want to delete <strong>{selectedKb?.name}</strong>? This action cannot be
          undone.
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

export default KnowledgeBaseList;
