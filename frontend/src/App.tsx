import { Route, Routes, BrowserRouter } from 'react-router-dom';

import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import GuestRoute from '@components/GuestRoute';
import PrivateRoute from '@components/PrivateRoute';
import { ROUTES } from '@constants/routes';
import { AuthProvider } from '@context/auth';
import Home from '@pages/Home';
import Login from '@pages/Login';
import Register from '@pages/Register';

import './App.css';

const queryClient = new QueryClient();

const theme = createTheme({
  primaryColor: 'gray',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  fontFamily: 'Inter, sans-serif',
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <ModalsProvider>
          <Notifications />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<PrivateRoute />}>
                  <Route path={ROUTES.HOME} element={<Home />} />
                </Route>
                <Route element={<GuestRoute />}>
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  <Route path={ROUTES.REGISTER} element={<Register />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
