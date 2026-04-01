package handlers

import (
	"encoding/json"
	"net/http"

	"build-a-bot/dto"
	"build-a-bot/middleware"
	"build-a-bot/models"
	"build-a-bot/repository"
	"build-a-bot/utils"
)

type ChatBotHandler struct {
	repo repository.ChatBotRepository
}

func NewChatBotHandler(repo repository.ChatBotRepository) *ChatBotHandler {
	return &ChatBotHandler{repo: repo}
}

// CreateChatBot godoc
// @Summary      Create a new chatbot
// @Tags         chatbots
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body dto.CreateChatBotRequest true "ChatBot creation payload"
// @Success      201  {object} dto.SuccessResponse[models.ChatBot]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      401  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /chatbots/create [post]
func (h *ChatBotHandler) CreateChatBot(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateChatBotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Get user ID from context (set by auth middleware)
	userId := uint(r.Context().Value(middleware.UserIDKey).(float64))

	apiKey, ok := utils.GenerateAPIKey()
	if !ok {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to generate API key")
		return
	}

	chatBot := &models.ChatBot{
		UserID:      userId,
		Name:        req.Name,
		Description: req.Description,
		APIKey:      *apiKey,
		Workflow:    req.Workflow,
		Config:      req.Config,
	}

	created, err := h.repo.Create(chatBot)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to create chatbot")
		return
	}

	utils.BuildJSONResponse(w, http.StatusCreated, dto.SuccessResponse[models.ChatBot]{
		Data:    *created,
		Message: "ChatBot successfully created",
	})
}
