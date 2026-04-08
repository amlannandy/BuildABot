import type { Edge, Node } from '@xyflow/react';

import type { ApiSuccessResponse } from '@dto/api';
import type { ActionType, ChatBot, WorkflowNode } from '@dto/chatbot';

function toNodeData(wn: WorkflowNode): Record<string, string | number | undefined> {
  const { action, intent, reply_template } = wn;
  switch (action.type) {
    case 'static_reply':
      return { intent: intent ?? '', message: action.message ?? '' };
    case 'collect_input':
      return { intent: intent ?? '', prompt: action.prompt ?? '', variable: action.variable ?? '' };
    case 'api_call':
      return {
        intent: intent ?? '',
        method: action.method ?? 'GET',
        endpoint: action.endpoint ?? '',
        replyTemplate: reply_template ?? '',
      };
    case 'knowledge_base':
      return { intent: intent ?? '', kbId: action.kb_id };
    case 'llm_generate':
      return { intent: intent ?? '', replyTemplate: reply_template ?? '' };
    case 'end_conversation':
      return { intent: intent ?? '', message: action.message ?? '' };
  }
}

export function transformAPIResponseIntoNodeData(
  apiData: ApiSuccessResponse<ChatBot> | undefined,
): {
  nodes: Node[];
  edges: Edge[];
} {
  if (!apiData?.data) return { nodes: [], edges: [] };

  const chatbot = apiData.data;
  const workflow = JSON.parse(chatbot.workflow ?? '{}') as { nodes?: WorkflowNode[] } | null;

  if (!workflow?.nodes?.length) return { nodes: [], edges: [] };

  const nodes: Node[] = workflow.nodes.map((wn) => ({
    id: wn.id,
    type: wn.action.type,
    position: {
      x: wn.position.x,
      y: wn.position.y,
    },
    data: toNodeData(wn),
  }));

  const edges: Edge[] = workflow.nodes
    .filter((wn): wn is WorkflowNode & { next_node: string } => Boolean(wn.next_node))
    .map((wn) => ({
      id: `${wn.id}->${wn.next_node}`,
      source: wn.id,
      target: wn.next_node,
    }));

  return { nodes, edges };
}

export function transformNodeDataIntoAPIRequest(nodes: Node[], edges: Edge[]): WorkflowNode[] {
  const edgesMap: Record<string, string> = {};
  edges.forEach((edge) => {
    edgesMap[edge.source] = edge.target;
  });
  return nodes.map((node) => {
    const nodeData = node.data;
    return {
      id: node.id,
      intent: nodeData.intent as string,
      position: node.position as {
        x: number;
        y: number;
      },
      next_node: edgesMap[node.id],
      action: {
        type: node.type as ActionType,
        variable: nodeData.variable as string,
        prompt: nodeData.prompt as string,
        endpoint: nodeData.endpoint as string,
        method: nodeData.method as string,
        message: nodeData.message as string,
        kb_id: Number(nodeData.kbId),
      },
    };
  });
}
