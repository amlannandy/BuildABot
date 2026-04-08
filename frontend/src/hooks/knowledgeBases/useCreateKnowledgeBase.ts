import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { createKnowledgeBase, type CreateKnowledgeBaseRequest } from '@api/knowledgeBases/createKnowledgeBase';
import type { ApiErrorResponse, ApiSuccessResponse } from '@dto/api';
import type { KnowledgeBase } from '@dto/knowledgeBase';

export function useCreateKnowledgeBase(): UseMutationResult<
  ApiSuccessResponse<KnowledgeBase>,
  ApiErrorResponse,
  CreateKnowledgeBaseRequest
> {
  return useMutation<ApiSuccessResponse<KnowledgeBase>, ApiErrorResponse, CreateKnowledgeBaseRequest>({
    mutationFn: (request) => createKnowledgeBase(request),
  });
}
