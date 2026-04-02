import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { register, type RegisterRequest } from '@api/auth/register';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';

export function useRegister(): UseMutationResult<
  ApiSuccessResponse<string>,
  ApiErrorResponse,
  RegisterRequest
> {
  return useMutation<ApiSuccessResponse<string>, ApiErrorResponse, RegisterRequest>({
    mutationFn: (registerData) => register(registerData),
  });
}
