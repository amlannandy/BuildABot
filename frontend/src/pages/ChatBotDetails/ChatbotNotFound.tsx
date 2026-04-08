import { Box, Button, Center, Stack, Text } from '@mantine/core';
import { IconRobotOff } from '@tabler/icons-react';

import { ROUTES } from '@constants/routes';
import useSafeNavigate from '@hooks/useSafeNavigate';

import styles from './styles.module.scss';

const ChatbotNotFound = () => {
  const { safeNavigate } = useSafeNavigate();

  return (
    <Center h={400}>
      <Stack align="center" gap="md" maw={320}>
        <Box className={styles.iconCircle}>
          <IconRobotOff size={36} color="var(--mantine-color-gray-5)" />
        </Box>
        <Stack align="center" gap={4}>
          <Text fw={600} size="md">
            Chatbot not found
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            This chatbot doesn't exist or you don't have access to it.
          </Text>
        </Stack>
        <Button
          variant="default"
          onClick={() => {
            safeNavigate(ROUTES.HOME);
          }}
        >
          Back to Chatbots
        </Button>
      </Stack>
    </Center>
  );
};

export default ChatbotNotFound;
