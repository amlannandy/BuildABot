import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { deleteChatBot } from '@api/chatbots/deleteChatBot';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';

export function useDeleteChatBot(): UseMutationResult<
  ApiSuccessResponse<null>,
  ApiErrorResponse,
  number
> {
  return useMutation<ApiSuccessResponse<null>, ApiErrorResponse, number>({
    mutationFn: (id) => deleteChatBot(id),
  });
}
