import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';
import type { ChatBot, Workflow } from '@dto/chatbot';

export interface UpdateChatBotRequest {
  id: number;
  name?: string;
  description?: string;
  workflow?: Workflow;
}

export async function updateChatBot(
  request: UpdateChatBotRequest,
): Promise<ApiSuccessResponse<ChatBot>> {
  const { id, ...body } = request;
  try {
    const response = await apiClient.patch<ApiSuccessResponse<ChatBot>>(
      `/chatbots/${id.toString()}`,
      body,
    );
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
