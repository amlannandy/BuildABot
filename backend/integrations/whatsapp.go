package integrations

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

const graphAPIURL = "https://graph.facebook.com/v18.0"

type WhatsAppClient interface {
	SendMessage(ctx context.Context, phoneNumberID, to, message string) error
}

type MetaClient struct {
	apiToken   string
	httpClient *http.Client
}

func NewMetaClient(apiToken string) WhatsAppClient {
	return &MetaClient{
		apiToken:   apiToken,
		httpClient: &http.Client{},
	}
}

func (m *MetaClient) SendMessage(ctx context.Context, phoneNumberID, to, message string) error {
	payload := map[string]any{
		"messaging_product": "whatsapp",
		"to":                to,
		"type":              "text",
		"text":              map[string]string{"body": message},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("whatsapp: failed to marshal payload: %w", err)
	}

	url := fmt.Sprintf("%s/%s/messages", graphAPIURL, phoneNumberID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("whatsapp: failed to build request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+m.apiToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := m.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("whatsapp: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("whatsapp: API returned status %d", resp.StatusCode)
	}

	return nil
}
