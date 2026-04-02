import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';

export async function deleteChatBot(id: number): Promise<ApiSuccessResponse<null>> {
  try {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(`/chatbots/${id.toString()}`);
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
