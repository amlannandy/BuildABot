import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { listChatBots, type ListChatBotsRequest } from '@api/chatbots/listChatBots';
import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';
import type { ApiErrorResponse, PaginatedResponse } from '@dto/api';
import type { ChatBot } from '@dto/chatbot';

export function useListChatBots(
  request: ListChatBotsRequest,
): UseQueryResult<PaginatedResponse<ChatBot>, ApiErrorResponse> {
  return useQuery<PaginatedResponse<ChatBot>, ApiErrorResponse>({
    queryKey: [REACT_QUERY_KEYS.LIST_CHATBOTS, request],
    queryFn: async () => {
      const response = await listChatBots(request);
      return response.data;
    },
  });
}
