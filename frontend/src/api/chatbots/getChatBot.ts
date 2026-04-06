import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';

export async function getChatBot(id: number): Promise<ApiSuccessResponse<ChatBot>> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<ChatBot>>(`/chatbots/${id.toString()}`);
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
