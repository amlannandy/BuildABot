package llm

import (
	"context"
	"fmt"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

type AnthropicClient struct {
	client *anthropic.Client
	model  anthropic.Model
}

func NewAnthropicClient(apiKey string, model anthropic.Model) Client {
	c := anthropic.NewClient(option.WithAPIKey(apiKey))
	return &AnthropicClient{client: &c, model: model}
}

func (a *AnthropicClient) Chat(ctx context.Context, messages []Message) (string, error) {
	var systemText string
	var msgParams []anthropic.MessageParam

	for _, m := range messages {
		switch m.Role {
		case RoleSystem:
			systemText = m.Content
		case RoleUser:
			msgParams = append(msgParams, anthropic.NewUserMessage(anthropic.NewTextBlock(m.Content)))
		case RoleAssistant:
			msgParams = append(msgParams, anthropic.NewAssistantMessage(anthropic.NewTextBlock(m.Content)))
		}
	}

	params := anthropic.MessageNewParams{
		Model:     a.model,
		MaxTokens: 1024,
		Messages:  msgParams,
	}

	if systemText != "" {
		params.System = []anthropic.TextBlockParam{{Text: systemText}}
	}

	resp, err := a.client.Messages.New(ctx, params)
	if err != nil {
		return "", fmt.Errorf("anthropic: chat failed: %w", err)
	}

	for _, block := range resp.Content {
		if tb, ok := block.AsAny().(anthropic.TextBlock); ok {
			return tb.Text, nil
		}
	}

	return "", fmt.Errorf("anthropic: no text content in response")
}
