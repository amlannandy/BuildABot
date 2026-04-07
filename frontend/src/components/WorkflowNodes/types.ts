export interface IntentNodeData {
  intent: string;
}

export interface StaticReplyNodeData {
  message: string;
}

export interface CollectInputNodeData {
  prompt: string;
  variable: string;
}

export interface ApiCallNodeData {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  replyTemplate?: string;
}

export interface KnowledgeBaseNodeData {
  kbId: number;
  kbName?: string;
  replyTemplate?: string;
}

export interface LLMGenerateNodeData {
  replyTemplate?: string;
}

export interface EndConversationNodeData {
  message?: string;
}
