package llm

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

type OpenAIClient struct {
	client openai.Client
	model  string
}

func NewOpenAIClient(apiKey, model string) Client {
	c := openai.NewClient(option.WithAPIKey(apiKey))
	return &OpenAIClient{client: c, model: model}
}

func (o *OpenAIClient) Chat(ctx context.Context, messages []Message) (string, error) {
	var params []openai.ChatCompletionMessageParamUnion

	for _, m := range messages {
		switch m.Role {
		case RoleSystem:
			params = append(params, openai.SystemMessage(m.Content))
		case RoleUser:
			params = append(params, openai.UserMessage(m.Content))
		case RoleAssistant:
			params = append(params, openai.AssistantMessage(m.Content))
		}
	}

	resp, err := o.client.Chat.Completions.New(ctx, openai.ChatCompletionNewParams{
		Model:    o.model,
		Messages: params,
	})
	if err != nil {
		return "", fmt.Errorf("openai: chat failed: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("openai: no choices in response")
	}

	return resp.Choices[0].Message.Content, nil
}
