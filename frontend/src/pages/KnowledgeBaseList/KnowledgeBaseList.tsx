import { Avatar, Center, Stack, Text } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';

const KnowledgeBaseList = () => {
  return (
    <Center py={80}>
      <Stack align="center" gap="sm">
        <Avatar size={56} radius="xl" color="gray" variant="light">
          <IconBook2 size={28} />
        </Avatar>
        <Text fw={500}>Knowledge Bases</Text>
        <Text size="sm" c="dimmed">
          Coming soon
        </Text>
      </Stack>
    </Center>
  );
};

export default KnowledgeBaseList;
