package embedding

import (
	"context"
	"fmt"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
	"github.com/openai/openai-go/packages/param"
)

type OpenAIClient struct {
	client openai.Client
}

func NewOpenAIClient(apiKey string) Client {
	c := openai.NewClient(option.WithAPIKey(apiKey))
	return &OpenAIClient{client: c}
}

func (o *OpenAIClient) Embed(ctx context.Context, text string) ([]float32, error) {
	resp, err := o.client.Embeddings.New(ctx, openai.EmbeddingNewParams{
		Model: openai.EmbeddingModelTextEmbedding3Small,
		Input: openai.EmbeddingNewParamsInputUnion{
			OfString: param.Opt[string]{Value: text},
		},
	})
	if err != nil {
		return nil, fmt.Errorf("openai: embed failed: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("openai: no embedding returned")
	}

	// SDK returns []float64; convert to []float32 for pgvector compatibility
	raw := resp.Data[0].Embedding
	vector := make([]float32, len(raw))
	for i, v := range raw {
		vector[i] = float32(v)
	}

	return vector, nil
}
