import type { ApiSuccessResponse } from '@dto/api';
import { ApiErrorHandler } from '@api/utils';
import apiClient from '@api/client';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function register(request: RegisterRequest): Promise<ApiSuccessResponse<string>> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<string>>('/auth/register', request);
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
