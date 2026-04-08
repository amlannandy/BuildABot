import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { listKnowledgeBases } from '@api/knowledgeBases/listKnowledgeBases';
import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import type { ApiErrorResponse, PaginatedResponse } from '@dto/api';
import type { KnowledgeBase } from '@dto/knowledgeBase';

export function useListKnowledgeBases(
  chatbotId: number,
  nameFilter?: string,
  page = 1,
  limit = 10,
): UseQueryResult<PaginatedResponse<KnowledgeBase>, ApiErrorResponse> {
  return useQuery<PaginatedResponse<KnowledgeBase>, ApiErrorResponse>({
    queryKey: [REACT_QUERY_KEYS.LIST_KNOWLEDGE_BASES, chatbotId, nameFilter, page, limit],
    queryFn: async () => {
      const response = await listKnowledgeBases({
        chatbot_id: chatbotId,
        page,
        limit,
        filters: { name: nameFilter },
      });
      return response.data;
    },
    enabled: chatbotId > 0,
  });
}
