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
