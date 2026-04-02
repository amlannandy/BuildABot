import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse, ListRequest, PaginatedResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';

export interface ChatBotFilters {
  name?: string;
  description?: string;
}

export type ListChatBotsRequest = ListRequest<ChatBotFilters>;

export async function listChatBots(
  request: ListChatBotsRequest,
): Promise<ApiSuccessResponse<PaginatedResponse<ChatBot>>> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<PaginatedResponse<ChatBot>>>(
      '/chatbots/list',
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
