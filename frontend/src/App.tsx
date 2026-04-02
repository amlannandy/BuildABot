import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import './App.css';

import Login from '@pages/Login';
import Register from '@pages/Register';
import Home from '@pages/Home';
import { ROUTES } from '@constants/routes';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
        <Notifications />
        <Router>
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
          </Routes>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
