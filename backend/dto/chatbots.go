package dto

import "encoding/json"

type CreateChatBotRequest struct {
	Name        string          `json:"name" validate:"required"`
	Description *string         `json:"description"`
	Workflow    json.RawMessage `json:"workflow"`
	Config      json.RawMessage `json:"config"`
}

type UpdateChatBotRequest struct {
	Name        *string         `json:"name" validate:"required_without_all=Description Workflow Config"`
	Description *string         `json:"description"`
	Workflow    json.RawMessage `json:"workflow"`
	Config      json.RawMessage `json:"config"`
}

type ChatBotFilters struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

type ListChatBotsRequest = ListRequest[ChatBotFilters]

type ChatRequest struct {
	Message        string `json:"message"`
	UserIdentifier string `json:"user_identifier"`
	APIKey         string `json:"api_key"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}
