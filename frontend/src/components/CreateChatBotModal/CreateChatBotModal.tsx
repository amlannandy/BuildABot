import { useEffect } from 'react';

import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import type { ApiErrorResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';
import { useCreateChatBot } from '@hooks/chatbots/useCreateChatBot';
import { useUpdateChatBot } from '@hooks/chatbots/useUpdateChatBot';
import { validateName } from '@utils/auth';

interface CreateChatBotModalProps {
  opened: boolean;
  onClose: () => void;
  chatbot: ChatBot | null;
}

interface FormValues {
  name: string;
  description: string;
}

const CreateChatBotModal = ({
  opened,
  onClose,
  chatbot,
}: CreateChatBotModalProps): React.ReactNode => {
  const queryClient = useQueryClient();
  const { mutate: createChatBot, isPending: isCreating } = useCreateChatBot();
  const { mutate: updateChatBot, isPending: isUpdating } = useUpdateChatBot();

  const isEditing = Boolean(chatbot);
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: validateName,
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit((values) => {
    const name = values.name.trim();
    const description = values.description.trim() || undefined;

    if (isEditing && chatbot) {
      updateChatBot(
        { id: chatbot.id, name, description },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Chatbot updated',
              message: `${name} has been updated.`,
              color: 'green',
            });
            void queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.LIST_CHATBOTS] });
            handleClose();
          },
          onError: (error: ApiErrorResponse) => {
            notifications.show({
              title: 'Update failed',
              message: error.errors[0] ?? 'Something went wrong',
              color: 'red',
            });
          },
        },
      );
      return;
    }

    createChatBot(
      { name, description },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Chatbot created',
            message: `${name} has been created.`,
            color: 'green',
          });
          void queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.LIST_CHATBOTS] });
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
  });

  useEffect(() => {
    if (opened) {
      form.setValues({
        name: chatbot?.name ?? '',
        description: chatbot?.description ?? '',
      });
    }
  }, [opened, chatbot, form]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? 'Edit Chatbot' : 'New Chatbot'}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          placeholder="Please enter a name for your chatbot"
          mb="md"
          {...form.getInputProps('name')}
        />
        <Textarea
          label="Description"
          placeholder="What does this bot do?"
          mb="xl"
          rows={4}
          {...form.getInputProps('description')}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default CreateChatBotModal;
