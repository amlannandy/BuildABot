export { default as StaticReplyNode } from './StaticReplyNode';
export { default as CollectInputNode } from './CollectInputNode';
export { default as ApiCallNode } from './ApiCallNode';
export { default as KnowledgeBaseNode } from './KnowledgeBaseNode';
export { default as LLMGenerateNode } from './LLMGenerateNode';
export { default as EndConversationNode } from './EndConversationNode';

export * from './types';

import StaticReplyNode from './StaticReplyNode';
import CollectInputNode from './CollectInputNode';
import ApiCallNode from './ApiCallNode';
import KnowledgeBaseNode from './KnowledgeBaseNode';
import LLMGenerateNode from './LLMGenerateNode';
import EndConversationNode from './EndConversationNode';

export const nodeTypes = {
  static_reply: StaticReplyNode,
  collect_input: CollectInputNode,
  api_call: ApiCallNode,
  knowledge_base: KnowledgeBaseNode,
  llm_generate: LLMGenerateNode,
  end_conversation: EndConversationNode,
};
