import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { login, type LoginRequest } from '@api/auth/login';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';

export function useLogin(): UseMutationResult<
  ApiSuccessResponse<string>,
  ApiErrorResponse,
  LoginRequest
> {
  return useMutation<ApiSuccessResponse<string>, ApiErrorResponse, LoginRequest>({
    mutationFn: (loginData) => login(loginData),
  });
}
