import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';
import type { User } from '@dto/user';

export async function getCurrentUser(): Promise<ApiSuccessResponse<User>> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<User>>('/auth/current-user');
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
