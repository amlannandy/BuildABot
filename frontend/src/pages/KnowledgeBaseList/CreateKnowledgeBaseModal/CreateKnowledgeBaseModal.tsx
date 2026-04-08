import { useRef, useState } from 'react';

import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import type { ApiErrorResponse } from '@dto/api';
import { useCreateKnowledgeBase } from '@hooks/knowledgeBases/useCreateKnowledgeBase';

interface CreateKnowledgeBaseModalProps {
  opened: boolean;
  chatbotId: number;
  onClose: () => void;
}

const CreateKnowledgeBaseModal = ({
  opened,
  chatbotId,
  onClose,
}: CreateKnowledgeBaseModalProps): React.ReactNode => {
  const queryClient = useQueryClient();
  const { mutate: createKnowledgeBase, isPending } = useCreateKnowledgeBase();

  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [nameError, setNameError] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setName('');
    setFile(null);
    setNameError('');
    setFileError('');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setFileError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else {
      setNameError('');
    }
    if (!file) {
      setFileError('File is required');
      valid = false;
    } else {
      setFileError('');
    }
    if (!valid) return;

    createKnowledgeBase(
      { chatbot_id: chatbotId, name: name.trim(), file: file! },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Knowledge base created',
            message: `${name.trim()} has been created.`,
            color: 'green',
          });
          void queryClient.invalidateQueries({
            queryKey: [REACT_QUERY_KEYS.LIST_KNOWLEDGE_BASES],
          });
          handleClose();
        },
        onError: (error: ApiErrorResponse) => {
          notifications.show({
            title: 'Creation failed',
            message: error.errors[0] ?? 'Something went wrong',
            color: 'red',
          });
        },
      },
    );
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="New Knowledge Base" size="sm">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Product FAQ"
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
            }}
            error={nameError}
          />
          <Stack gap={4}>
            <Text size="sm" fw={500}>
              File
            </Text>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="default"
              size="sm"
              leftSection={<IconUpload size={14} />}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              {file ? file.name : 'Choose file (.txt or .pdf)'}
            </Button>
            {fileError && (
              <Text size="xs" c="red">
                {fileError}
              </Text>
            )}
          </Stack>
        </Stack>
        <Group justify="flex-end" gap="sm" mt="xl">
          <Button variant="default" size="xs" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" size="xs" loading={isPending}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateKnowledgeBaseModal;
