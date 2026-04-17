import apiClient from '@api/client';
import { ApiErrorHandler } from '@api/utils';
import type { ApiSuccessResponse } from '@dto/api';

export interface SendMessageRequest {
  chatbotId: number;
  message: string;
  userIdentifier: string;
  apiKey: string;
}

export interface ChatResponse {
  reply: string;
}

export async function sendMessage(
  request: SendMessageRequest,
): Promise<ApiSuccessResponse<ChatResponse>> {
  try {
    const response = await apiClient.post<ApiSuccessResponse<ChatResponse>>(
      `/chatbots/${request.chatbotId.toString()}/chat`,
      {
        message: request.message,
        user_identifier: request.userIdentifier,
        api_key: request.apiKey,
      },
    );
    if ('errors' in response.data) {
      throw ApiErrorHandler(response.data);
    }
    return response.data;
  } catch (error) {
    throw ApiErrorHandler(error);
  }
}
