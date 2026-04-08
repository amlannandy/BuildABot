import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse, PaginatedResponse } from '@dto/api';
import type { KnowledgeBase } from '@dto/knowledgeBase';

export interface ListKnowledgeBasesFilters {
  name?: string;
}

export interface ListKnowledgeBasesRequest {
  chatbot_id: number;
  page: number;
  limit: number;
  filters: ListKnowledgeBasesFilters;
}

export async function listKnowledgeBases(
  request: ListKnowledgeBasesRequest,
): Promise<ApiSuccessResponse<PaginatedResponse<KnowledgeBase>>> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<PaginatedResponse<KnowledgeBase>>>(
      '/knowledge-bases/list',
      request,
    );
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
