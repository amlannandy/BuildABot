package llm

import "context"

type Role string

const (
	RoleUser      Role = "user"
	RoleAssistant Role = "assistant"
	RoleSystem    Role = "system"
)

type Message struct {
	Role    Role
	Content string
}

// Client is the interface for LLM text generation.
// The engine uses this to detect intent and generate replies.
type Client interface {
	Chat(ctx context.Context, messages []Message) (string, error)
}
