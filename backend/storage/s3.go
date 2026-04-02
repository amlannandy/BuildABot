package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Client struct {
	client *s3.Client
	bucket string
}

func NewS3Client(bucket, region, accessKey, secretKey string) Client {
	cfg := aws.Config{
		Region:      region,
		Credentials: credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
	}
	return &S3Client{
		client: s3.NewFromConfig(cfg),
		bucket: bucket,
	}
}

func (s *S3Client) Upload(ctx context.Context, key string, body io.Reader, contentType string) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return fmt.Errorf("s3: upload failed for key %q: %w", key, err)
	}
	return nil
}

func (s *S3Client) Download(ctx context.Context, key string) ([]byte, error) {
	resp, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, fmt.Errorf("s3: download failed for key %q: %w", key, err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("s3: failed to read body for key %q: %w", key, err)
	}
	return data, nil
}

func (s *S3Client) Delete(ctx context.Context, key string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("s3: delete failed for key %q: %w", key, err)
	}
	return nil
}

// KeyForKnowledgeBase returns the S3 object key for a knowledge base file.
// e.g. KeyForKnowledgeBase(42, "return-policy.pdf") → "knowledge-bases/42/return-policy.pdf"
func KeyForKnowledgeBase(kbID uint, filename string) string {
	return fmt.Sprintf("knowledge-bases/%d/%s", kbID, filename)
}
