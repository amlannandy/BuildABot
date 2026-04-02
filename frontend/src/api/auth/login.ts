import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';

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
