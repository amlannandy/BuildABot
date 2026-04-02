import { Navigate, Outlet } from 'react-router-dom';

import { Center, Loader } from '@mantine/core';

import { ROUTES } from '@constants/routes';
import { useAuth } from '@context/auth';

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return isAuthenticated ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
}
