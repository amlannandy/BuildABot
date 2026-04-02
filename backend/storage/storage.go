package storage

import (
	"context"
	"io"
)

// Client is the interface for file storage operations.
// Used to upload, retrieve, and delete knowledge base files.
type Client interface {
	Upload(ctx context.Context, key string, body io.Reader, contentType string) error
	Download(ctx context.Context, key string) ([]byte, error)
	Delete(ctx context.Context, key string) error
}
