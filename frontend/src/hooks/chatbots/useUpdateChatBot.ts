import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { updateChatBot, type UpdateChatBotRequest } from '@api/chatbots/updateChatBot';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';

export function useUpdateChatBot(): UseMutationResult<
  ApiSuccessResponse<ChatBot>,
  ApiErrorResponse,
  UpdateChatBotRequest
> {
  return useMutation<ApiSuccessResponse<ChatBot>, ApiErrorResponse, UpdateChatBotRequest>({
    mutationFn: (request) => updateChatBot(request),
  });
}
