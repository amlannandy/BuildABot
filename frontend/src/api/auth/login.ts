import type { ApiSuccessResponse } from '@dto/api';
import { ApiErrorHandler } from '@api/utils';
import apiClient from '@api/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export async function login(request: LoginRequest): Promise<ApiSuccessResponse<string>> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<string>>('/auth/login', request);
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
