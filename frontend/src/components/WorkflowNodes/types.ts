export interface StaticReplyNodeData extends Record<string, unknown> {
  intent?: string;
  message: string;
}

export interface CollectInputNodeData extends Record<string, unknown> {
  intent?: string;
  prompt: string;
  variable: string;
}

export interface ApiCallNodeData extends Record<string, unknown> {
  intent?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  replyTemplate?: string;
}

export interface KnowledgeBaseNodeData extends Record<string, unknown> {
  chatbotId: number;
  intent?: string;
  kbId?: number;
  kbName?: string;
}

export interface LLMGenerateNodeData extends Record<string, unknown> {
  intent?: string;
  replyTemplate?: string;
}

export interface EndConversationNodeData extends Record<string, unknown> {
  intent?: string;
  message?: string;
}
