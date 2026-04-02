import { type ReactNode } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import { AuthContext } from '@context/auth/context';
import { useGetCurrentUser } from '@hooks/auth/useGetCurrentUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetCurrentUser();

  const user = data?.data ?? null;

  function logout() {
    localStorage.removeItem('authToken');
    queryClient.removeQueries({ queryKey: [REACT_QUERY_KEYS.GET_CURRENT_USER] });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
