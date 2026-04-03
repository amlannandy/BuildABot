package engine

import (
	"encoding/json"
	"fmt"
	"strings"
)

type ActionType string

const (
	ActionTypeStaticReply      ActionType = "static_reply"
	ActionTypeCollectInput     ActionType = "collect_input"
	ActionTypeKnowledgeBase    ActionType = "knowledge_base"
	ActionTypeAPICall          ActionType = "api_call"
	ActionTypeLLMGenerate      ActionType = "llm_generate"
	ActionTypeEndConversation  ActionType = "end_conversation"
)

type Action struct {
	Type     ActionType `json:"type"`
	Message  string     `json:"message,omitempty"`  // static_reply, end_conversation
	Variable string     `json:"variable,omitempty"` // collect_input
	Prompt   string     `json:"prompt,omitempty"`   // collect_input
	KBID     uint       `json:"kb_id,omitempty"`    // knowledge_base
	Endpoint string     `json:"endpoint,omitempty"` // api_call
	Method   string     `json:"method,omitempty"`   // api_call
}

type WorkflowNode struct {
	ID            string `json:"id"`
	Intent        string `json:"intent,omitempty"`
	Action        Action `json:"action"`
	NextNodeID    string `json:"next_node,omitempty"`
	ReplyTemplate string `json:"reply_template,omitempty"`
}

type Workflow struct {
	Nodes []WorkflowNode `json:"nodes"`
}

func ParseWorkflow(raw string) (*Workflow, error) {
	var w Workflow
	if err := json.Unmarshal([]byte(raw), &w); err != nil {
		return nil, fmt.Errorf("workflow: failed to parse: %w", err)
	}
	return &w, nil
}

// FindByIntent returns the first node whose intent matches the given string.
// Used after intent detection to find the entry node for a new flow.
func (w *Workflow) FindByIntent(intent string) *WorkflowNode {
	for i := range w.Nodes {
		if w.Nodes[i].Intent == intent {
			return &w.Nodes[i]
		}
	}
	return nil
}

// FindByID returns the node with the given ID.
// Used when a session is active to jump directly to the current node.
func (w *Workflow) FindByID(id string) *WorkflowNode {
	for i := range w.Nodes {
		if w.Nodes[i].ID == id {
			return &w.Nodes[i]
		}
	}
	return nil
}

// Intents returns all intent strings defined across the workflow nodes.
// Nodes without an intent (mid-flow nodes) are excluded.
// Used to seed the intent detection LLM prompt.
func (w *Workflow) Intents() []string {
	var intents []string
	for _, node := range w.Nodes {
		if node.Intent != "" {
			intents = append(intents, node.Intent)
		}
	}
	return intents
}

// InterpolateTemplate replaces {{variable_name}} placeholders in a template
// string with values from the provided variables map.
func InterpolateTemplate(template string, variables map[string]string) string {
	result := template
	for k, v := range variables {
		result = strings.ReplaceAll(result, "{{"+k+"}}", v)
	}
	return result
}
