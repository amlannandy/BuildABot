import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { deleteKnowledgeBase } from '@api/knowledgeBases/deleteKnowledgeBase';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';

export function useDeleteKnowledgeBase(): UseMutationResult<
  ApiSuccessResponse<null>,
  ApiErrorResponse,
  number
> {
  return useMutation<ApiSuccessResponse<null>, ApiErrorResponse, number>({
    mutationFn: (id) => deleteKnowledgeBase(id),
  });
}
