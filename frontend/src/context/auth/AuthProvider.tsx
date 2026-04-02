import { type ReactNode } from 'react';

import axios from 'axios';

import { useQueryClient } from '@tanstack/react-query';

import { LOCAL_STORAGE_KEYS } from '@constants/localStorage';
import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import { ROUTES } from '@constants/routes';
import { AuthContext } from '@context/auth/context';
import { useGetCurrentUser } from '@hooks/auth/useGetCurrentUser';
import useSafeNavigate from '@hooks/useSafeNavigate';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetCurrentUser();
  const { safeNavigate } = useSafeNavigate();

  const user = data?.data ?? null;

  const authenticate = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    queryClient.removeQueries({ queryKey: [REACT_QUERY_KEYS.GET_CURRENT_USER] });
    safeNavigate(ROUTES.LOGIN);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, logout, authenticate }}
    >
      {children}
    </AuthContext.Provider>
  );
}
