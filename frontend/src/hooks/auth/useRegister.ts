import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';
import { register, type RegisterRequest } from '@api/auth/register';

export function useRegister(): UseMutationResult<
  ApiSuccessResponse<string>,
  ApiErrorResponse,
  RegisterRequest
> {
  return useMutation<ApiSuccessResponse<string>, ApiErrorResponse, RegisterRequest>({
    mutationFn: (registerData) => register(registerData),
  });
}
