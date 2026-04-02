import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getCurrentUser } from '@api/auth/getCurrentUser';
import { LOCAL_STORAGE_KEYS } from '@constants/localStorage';
import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';
import type { User } from '@dto/user';

export function useGetCurrentUser(): UseQueryResult<ApiSuccessResponse<User>, ApiErrorResponse> {
  return useQuery<ApiSuccessResponse<User>, ApiErrorResponse>({
    queryKey: [REACT_QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
    enabled: !!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN),
    retry: false,
  });
}
