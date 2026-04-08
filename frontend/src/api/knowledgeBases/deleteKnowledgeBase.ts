import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';

export async function deleteKnowledgeBase(id: number): Promise<ApiSuccessResponse<null>> {
  try {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(
      `/knowledge-bases/${id.toString()}`,
    );
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
