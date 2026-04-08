package dto

type KnowledgeBaseFilters struct {
	Name *string `json:"name"`
}

type ListKnowledgeBasesRequest struct {
	ListRequest[KnowledgeBaseFilters]
	ChatBotID uint `json:"chatbot_id"`
}
