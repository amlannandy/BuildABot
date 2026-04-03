package dto

type CreateChatBotRequest struct {
	Name        string  `json:"name" validate:"required"`
	Description *string `json:"description"`
	Workflow    *string `json:"workflow"`
	Config      *string `json:"config"`
}

type UpdateChatBotRequest struct {
	Name        *string `json:"name" validate:"required_without_all=Description Workflow Config"`
	Description *string `json:"description"`
	Workflow    *string `json:"workflow"`
	Config      *string `json:"config"`
}

type ChatBotFilters struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

type ListChatBotsRequest = ListRequest[ChatBotFilters]

type ChatRequest struct {
	Message        string `json:"message"`
	UserIdentifier string `json:"user_identifier"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}
