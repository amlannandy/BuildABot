import { useQuery } from '@tanstack/react-query';

import { getChatBot } from '@api/chatbots/getChatBot';
import { REACT_QUERY_KEYS } from '@constants/reactQueryKeys';

export function useGetChatBot(id: number) {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.GET_CHATBOT, id],
    queryFn: () => getChatBot(id),
    enabled: !!id,
  });
}
