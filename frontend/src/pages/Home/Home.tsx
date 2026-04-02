import { Route, Routes } from 'react-router-dom';

import { IconLogout } from '@tabler/icons-react';

import { AppShell, Avatar, Group, Image, Menu, Text } from '@mantine/core';

import logo from '@assets/logo.png';
import { ROUTES } from '@constants/routes';
import { useAuth } from '@context/auth';
import ChatbotDetails from '@pages/ChatBotDetails';
import ChatBotList from '@pages/ChatBotList';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <AppShell header={{ height: 60 }} padding="xl">
      <AppShell.Header>
        <Group h="100%" px="xl" justify="center">
          <Group w="100%" maw={1000} justify="space-between">
            <Group gap="xs">
              <Image src={logo} w={32} h={32} fit="cover" />
              <Text fw={700} size="lg">
                BuildABot
              </Text>
            </Group>
            <Menu shadow="md" width={180}>
              <Menu.Target>
                <Group gap="xs" style={{ cursor: 'pointer' }}>
                  <Avatar size="sm" radius="xl" color="gray" variant="filled">
                    {user?.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500}>
                    {user?.name}
                  </Text>
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={logout}>
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Routes>
          <Route element={<ChatbotDetails />} path={ROUTES.CHATBOT_DETAILS} />
          <Route element={<ChatBotList />} path={ROUTES.HOME} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

export default Home;
