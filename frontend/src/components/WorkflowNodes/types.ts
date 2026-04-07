export const NodeActionType = {
  COLLECT_INPUT: 'collect_input',
  STATIC_REPLY: 'static_reply',
  API_CALL: 'api_call',
  KNOWLEDGE_BASE: 'knowledge_base',
  LLM_GENERATE: 'llm_generate',
  END_CONVERSATION: 'end_conversation',
} as const;

export type NodeActionType = (typeof NodeActionType)[keyof typeof NodeActionType];
export interface StaticReplyNodeData extends Record<string, unknown> {
  intent: string;
  setIntent: (intent: string) => void;
  message: string;
  setMessage: (message: string) => void;
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
  intent?: string;
  kbId: number;
  kbName?: string;
  replyTemplate?: string;
}

export interface LLMGenerateNodeData extends Record<string, unknown> {
  intent?: string;
  replyTemplate?: string;
}

export interface EndConversationNodeData extends Record<string, unknown> {
  intent?: string;
  message?: string;
}
