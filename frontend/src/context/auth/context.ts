import { createContext, useContext } from 'react';

import type { AuthContextReturnType } from './types';

export const AuthContext = createContext<AuthContextReturnType | null>(null);

export function useAuth(): AuthContextReturnType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
