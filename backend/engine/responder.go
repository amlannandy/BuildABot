package engine

import (
	"build-a-bot/llm"
	"context"
	"fmt"
	"strings"
)

// generateReply builds the final LLM prompt from the action result and
// conversation history, then returns the model's reply.
func (e *Engine) generateReply(
	ctx context.Context,
	input string,
	actionResult string,
	replyTemplate string,
	history []llm.Message,
) (string, error) {
	messages := buildMessages(input, actionResult, replyTemplate, history)

	reply, err := e.llm.Chat(ctx, messages)
	if err != nil {
		return "", fmt.Errorf("responder: LLM call failed: %w", err)
	}

	return reply, nil
}

// buildMessages constructs the message slice for the LLM call.
// When an actionResult is provided (from knowledge_base or api_call), it is
// injected into the system prompt as context.
// When there is no actionResult (llm_generate), conversation history is passed
// so the LLM can give a coherent multi-turn reply.
func buildMessages(input, actionResult, replyTemplate string, history []llm.Message) []llm.Message {
	var systemParts []string
	systemParts = append(systemParts, "You are a helpful assistant.")

	if actionResult != "" {
		systemParts = append(systemParts, fmt.Sprintf(
			"Use the following information to answer the user's question:\n\n<context>\n%s\n</context>",
			actionResult,
		))
	}

	if replyTemplate != "" {
		systemParts = append(systemParts, fmt.Sprintf(
			"Format your reply using this template:\n%s",
			replyTemplate,
		))
	}

	messages := []llm.Message{
		{Role: llm.RoleSystem, Content: strings.Join(systemParts, "\n\n")},
	}

	// Include conversation history for context (used mainly for llm_generate)
	messages = append(messages, history...)

	// Append the current user message
	messages = append(messages, llm.Message{
		Role:    llm.RoleUser,
		Content: input,
	})

	return messages
}
