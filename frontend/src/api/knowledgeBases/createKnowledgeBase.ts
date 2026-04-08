import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';
import type { KnowledgeBase } from '@dto/knowledgeBase';

export interface CreateKnowledgeBaseRequest {
  chatbot_id: number;
  name: string;
  file: File;
}

export async function createKnowledgeBase(
  request: CreateKnowledgeBaseRequest,
): Promise<ApiSuccessResponse<KnowledgeBase>> {
  try {
    const formData = new FormData();
    formData.append('chatbot_id', request.chatbot_id.toString());
    formData.append('name', request.name);
    formData.append('file', request.file);

    const response = await apiClient.post<ApiSuccessResponse<KnowledgeBase>>(
      '/knowledge-bases/create',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
