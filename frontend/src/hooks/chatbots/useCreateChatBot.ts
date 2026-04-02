import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { createChatBot, type CreateChatBotRequest } from '@api/chatbots/createChatBot';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';

export function useCreateChatBot(): UseMutationResult<
  ApiSuccessResponse<ChatBot>,
  ApiErrorResponse,
  CreateChatBotRequest
> {
  return useMutation<ApiSuccessResponse<ChatBot>, ApiErrorResponse, CreateChatBotRequest>({
    mutationFn: (request) => createChatBot(request),
  });
}
