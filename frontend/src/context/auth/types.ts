import type { User } from '@dto/user';

export interface AuthContextReturnType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}
