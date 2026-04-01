package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"build-a-bot/dto"
	"build-a-bot/middleware"
	"build-a-bot/models"
	"build-a-bot/repository"
	"build-a-bot/utils"

	"github.com/gorilla/mux"
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

// ListChatBots godoc
// @Summary      List chatbots with pagination and filters
// @Tags         chatbots
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body dto.ListChatBotsRequest true "List chatbots payload"
// @Success      200  {object} dto.SuccessResponse[dto.PaginatedResponse[models.ChatBot]]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /chatbots/list [post]
func (h *ChatBotHandler) ListChatBots(w http.ResponseWriter, r *http.Request) {
	var req dto.ListChatBotsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Page <= 0 {
		req.Page = 1
	}

	userId := uint(r.Context().Value(middleware.UserIDKey).(float64))
	offset := (req.Page - 1) * req.Limit

	chatBots, total, err := h.repo.FindPaginated(repository.ChatBotListParams{
		UserID:     userId,
		Limit:      req.Limit,
		Offset:     offset,
		NameFilter: req.Filters.Name,
		DescFilter: req.Filters.Description,
	})
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to fetch chatbots")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[dto.PaginatedResponse[models.ChatBot]]{
		Data: dto.PaginatedResponse[models.ChatBot]{
			Data: chatBots,
			Pagination: dto.PaginationMeta{
				Page:    req.Page,
				Limit:   req.Limit,
				Total:   total,
				HasMore: int64(offset+req.Limit) < total,
				HasPrev: req.Page > 1,
			},
		},
		Message: "ChatBots retrieved successfully",
	})
}

// GetChatBot godoc
// @Summary      Get chatbot details by ID
// @Tags         chatbots
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ChatBot ID"
// @Success      200  {object} dto.SuccessResponse[models.ChatBot]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      404  {object} dto.ErrorResponse
// @Router       /chatbots/{id} [get]
func (h *ChatBotHandler) GetChatBot(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid chatbot ID")
		return
	}
	chatBotId := uint(id)

	chatBot, err := h.repo.FindByID(chatBotId)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusNotFound, "ChatBot not found")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[models.ChatBot]{
		Data:    *chatBot,
		Message: "ChatBot details retrieved successfully",
	})
}

// UpdateChatBot godoc
// @Summary      Update chatbot details
// @Tags         chatbots
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ChatBot ID"
// @Param        body body dto.UpdateChatBotRequest true "ChatBot update payload"
// @Success      200  {object} dto.SuccessResponse[models.ChatBot]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      404  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /chatbots/{id} [patch]
func (h *ChatBotHandler) UpdateChatBot(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid chatbot ID")
		return
	}
	chatBotId := uint(id)

	var req dto.UpdateChatBotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Fetch chatbot to verify ownership and existence
	chatBot, err := h.repo.FindByID(chatBotId)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusNotFound, "ChatBot not found")
		return
	}

	userId := uint(r.Context().Value(middleware.UserIDKey).(float64))
	if chatBot.UserID != userId {
		utils.BuildErrorResponse(w, http.StatusForbidden, "You are not the owner of this chatbot")
		return
	}

	// Update fields if provided
	if req.Name != nil {
		chatBot.Name = *req.Name
	}
	if req.Description != nil {
		chatBot.Description = req.Description
	}
	if req.Workflow != nil {
		chatBot.Workflow = req.Workflow
	}
	if req.Config != nil {
		chatBot.Config = req.Config
	}

	updated, err := h.repo.Update(chatBot)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to update chatbot")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[models.ChatBot]{
		Data:    *updated,
		Message: "ChatBot updated successfully",
	})
}

// DeleteChatBot godoc
// @Summary      Delete a chatbot
// @Tags         chatbots
// @Produce      json
// @Security     BearerAuth
// @Param        id path int true "ChatBot ID"
// @Success      200  {object} dto.SuccessResponse[any]
// @Failure      403  {object} dto.ErrorResponse
// @Failure      404  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /chatbots/{id} [delete]
func (h *ChatBotHandler) DeleteChatBot(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid chatbot ID")
		return
	}
	chatBotId := uint(id)

	userId := uint(r.Context().Value(middleware.UserIDKey).(float64))

	// Fetch chatbot to verify ownership
	chatBot, err := h.repo.FindByID(chatBotId)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusNotFound, "ChatBot not found")
		return
	}

	if chatBot.UserID != userId {
		utils.BuildErrorResponse(w, http.StatusForbidden, "You are not the owner of this chatbot")
		return
	}

	err = h.repo.Delete(chatBotId)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to delete chatbot")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[any]{
		Message: "ChatBot deleted successfully",
	})
}
