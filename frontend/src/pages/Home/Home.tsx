import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppShell, Avatar, Box, Group, Image, Menu, Tabs, Text } from '@mantine/core';
import { IconBook2, IconLogout, IconRobot } from '@tabler/icons-react';

import logo from '@assets/logo.png';
import { ROUTES } from '@constants/routes';
import { useAuth } from '@context/auth';
import ChatbotDetails from '@pages/ChatBotDetails';
import ChatBotList from '@pages/ChatBotList';
import KnowledgeBaseList from '@pages/KnowledgeBaseList';

import styles from './styles.module.scss';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<string | null>('chatbots');

  return (
    <Box className={styles.dashboard}>
      <Box className={styles.tabHeader}>
        <Tabs value={activeTab} onChange={setActiveTab} variant="unstyled" h="100%">
          <Tabs.List h="100%">
            <Tabs.Tab
              value="chatbots"
              leftSection={<IconRobot size={14} />}
              className={styles.tabButton}
            >
              Chatbots
            </Tabs.Tab>
            <Tabs.Tab
              value="knowledge_bases"
              leftSection={<IconBook2 size={14} />}
              className={styles.tabButton}
            >
              Knowledge Bases
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>

      <Box className={styles.content}>
        {activeTab === 'chatbots' && <ChatBotList />}
        {activeTab === 'knowledge_bases' && <KnowledgeBaseList />}
      </Box>
    </Box>
  );
};

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <AppShell header={{ height: 60 }} padding={0}>
      <AppShell.Header className={styles.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Image src={logo} w={28} h={28} fit="cover" />
            <Text fw={600} size="sm">
              BuildABot
            </Text>
          </Group>
          <Menu shadow="md" width={180}>
            <Menu.Target>
              <Group gap="xs" className={styles.userMenuTarget}>
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
      </AppShell.Header>
      <AppShell.Main>
        <Routes>
          <Route element={<ChatbotDetails />} path={ROUTES.CHATBOT_DETAILS} />
          <Route element={<DashboardPage />} path={ROUTES.HOME} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

export default Home;
