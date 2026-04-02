package embedding

import "context"

// Client is the interface for generating text embeddings.
// The engine uses this to embed KB chunks at upload time
// and user input at query time for vector similarity search.
type Client interface {
	Embed(ctx context.Context, text string) ([]float32, error)
}
