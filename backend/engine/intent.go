package engine

import (
	"build-a-bot/llm"
	"context"
	"encoding/json"
	"fmt"
	"strings"
)

type intentResponse struct {
	Intent string `json:"intent"`
}

// DetectIntent uses the LLM to classify the user's input into one of the
// provided intents. If the LLM returns an unrecognised intent, "fallback" is
// returned so the engine always has a valid node to route to.
func DetectIntent(ctx context.Context, client llm.Client, input string, intents []string) (string, error) {
	if len(intents) == 0 {
		return "fallback", nil
	}

	systemPrompt := fmt.Sprintf(
		`You are an intent classifier. Given a user message, classify it into exactly one of the following intents:
["%s"]

Rules:
- Reply with only valid JSON in this exact format: {"intent": "<intent>"}
- Do not explain. Do not add anything else.
- If the message does not match any intent, return: {"intent": "fallback"}`,
		strings.Join(intents, `", "`),
	)

	messages := []llm.Message{
		{Role: llm.RoleSystem, Content: systemPrompt},
		{Role: llm.RoleUser, Content: input},
	}

	raw, err := client.Chat(ctx, messages)
	if err != nil {
		return "", fmt.Errorf("intent: LLM call failed: %w", err)
	}

	var resp intentResponse
	if err := json.Unmarshal([]byte(raw), &resp); err != nil {
		// LLM returned something unparseable — safe fallback
		return "fallback", nil
	}

	// Validate the returned intent is actually in our list
	for _, intent := range intents {
		if intent == resp.Intent {
			return resp.Intent, nil
		}
	}

	// LLM returned a valid JSON but with an intent not in our list
	return "fallback", nil
}
