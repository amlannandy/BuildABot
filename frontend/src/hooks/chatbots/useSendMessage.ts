import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { sendMessage, type SendMessageRequest, type ChatResponse } from '@api/chatbots/sendMessage';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';

export function useSendMessage(): UseMutationResult<
  ApiSuccessResponse<ChatResponse>,
  ApiErrorResponse,
  SendMessageRequest
> {
  return useMutation<ApiSuccessResponse<ChatResponse>, ApiErrorResponse, SendMessageRequest>({
    mutationFn: (request) => sendMessage(request),
  });
}
