export type ActionType =
  | 'static_reply'
  | 'collect_input'
  | 'knowledge_base'
  | 'api_call'
  | 'llm_generate'
  | 'end_conversation';

export interface Action {
  type: ActionType;
  message?: string; // static_reply, end_conversation
  variable?: string; // collect_input
  prompt?: string; // collect_input
  kb_id?: number; // knowledge_base
  endpoint?: string; // api_call
  method?: string; // api_call
}

export interface WorkflowNode {
  id: string;
  intent?: string;
  action: Action;
  next_node?: string;
  reply_template?: string;
  position: { x: number; y: number };
}

export interface Workflow {
  nodes?: WorkflowNode[];
}

export interface ChatBot {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  api_key: string;
  workflow: string | null;
  config: string | null;
  created_at: string;
  updated_at: string;
}
