import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';

export interface CreateChatBotRequest {
  name: string;
  description?: string;
}

export async function createChatBot(
  request: CreateChatBotRequest,
): Promise<ApiSuccessResponse<ChatBot>> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<ChatBot>>('/chatbots/create', request);
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
