package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"build-a-bot/dto"
	"build-a-bot/embedding"
	"build-a-bot/models"
	"build-a-bot/repository"
	"build-a-bot/storage"
	"build-a-bot/utils"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/ledongthuc/pdf"
	"github.com/pgvector/pgvector-go"
)

type KnowledgeBaseHandler struct {
	repo      repository.KnowledgeBaseRepository
	storage   storage.Client
	embedding embedding.Client
}

func NewKnowledgeBaseHandler(
	repo repository.KnowledgeBaseRepository,
	storage storage.Client,
	embedding embedding.Client,
) *KnowledgeBaseHandler {
	return &KnowledgeBaseHandler{
		repo:      repo,
		storage:   storage,
		embedding: embedding,
	}
}

// ListKnowledgeBases godoc
// @Summary      List knowledge bases for a chatbot with pagination and filters
// @Tags         knowledge-bases
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body body dto.ListKnowledgeBasesRequest true "List knowledge bases payload"
// @Success      200  {object} dto.SuccessResponse[dto.PaginatedResponse[models.KnowledgeBase]]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /knowledge-bases/list [post]
func (h *KnowledgeBaseHandler) ListKnowledgeBases(w http.ResponseWriter, r *http.Request) {
	var req dto.ListKnowledgeBasesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.ChatBotID == 0 {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "chatbot_id is required")
		return
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Page <= 0 {
		req.Page = 1
	}

	offset := (req.Page - 1) * req.Limit

	kbs, total, err := h.repo.FindPaginated(repository.KnowledgeBaseListParams{
		ChatBotID:  req.ChatBotID,
		Limit:      req.Limit,
		Offset:     offset,
		NameFilter: req.Filters.Name,
	})
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to fetch knowledge bases")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[dto.PaginatedResponse[models.KnowledgeBase]]{
		Data: dto.PaginatedResponse[models.KnowledgeBase]{
			Data: kbs,
			Pagination: dto.PaginationMeta{
				Page:    req.Page,
				Limit:   req.Limit,
				Total:   total,
				HasMore: int64(offset+req.Limit) < total,
				HasPrev: req.Page > 1,
			},
		},
		Message: "Knowledge bases retrieved successfully",
	})
}

// CreateKnowledgeBase godoc
// @Summary      Create a new knowledge base from an uploaded file
// @Tags         knowledge-bases
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        chatbot_id  formData  int     true  "ChatBot ID"
// @Param        name        formData  string  true  "Knowledge Base name"
// @Param        file        formData  file    true  "File to upload (.txt or .pdf)"
// @Success      201  {object} dto.SuccessResponse[models.KnowledgeBase]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      422  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /knowledge-bases/create [post]
func (h *KnowledgeBaseHandler) CreateKnowledgeBase(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Failed to parse multipart form")
		return
	}

	chatBotIDStr := r.FormValue("chatbot_id")
	chatBotID, err := strconv.ParseUint(chatBotIDStr, 10, 64)
	if err != nil || chatBotID == 0 {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid chatbot_id")
		return
	}

	name := r.FormValue("name")
	if name == "" {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "name is required")
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	filename := fileHeader.Filename
	ext := strings.ToLower(strings.TrimPrefix(filepath.Ext(filename), "."))
	if ext != "txt" && ext != "pdf" {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Only .txt and .pdf files are supported")
		return
	}

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to read file")
		return
	}

	s3Key := fmt.Sprintf("knowledge-bases/%d/%s/%s", chatBotID, uuid.NewString(), filename)

	var contentType string
	if ext == "pdf" {
		contentType = "application/pdf"
	} else {
		contentType = "text/plain"
	}

	if err := h.storage.Upload(r.Context(), s3Key, bytes.NewReader(fileBytes), contentType); err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to upload file to storage")
		return
	}

	text, err := extractText(fileBytes, ext)
	if err != nil {
		_ = h.storage.Delete(r.Context(), s3Key)
		utils.BuildErrorResponse(w, http.StatusUnprocessableEntity, "Failed to parse file content")
		return
	}

	kb := &models.KnowledgeBase{
		ChatBotID: uint(chatBotID),
		Name:      name,
		FileName:  filename,
		S3Key:     s3Key,
		FileType:  models.FileType(ext),
	}
	created, err := h.repo.Create(kb)
	if err != nil {
		_ = h.storage.Delete(r.Context(), s3Key)
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to create knowledge base")
		return
	}

	chunks := chunkText(text, 300)
	knowledgeChunks := make([]models.KnowledgeChunk, 0, len(chunks))
	for i, chunk := range chunks {
		vector, err := h.embedding.Embed(r.Context(), chunk)
		if err != nil {
			_ = h.storage.Delete(r.Context(), s3Key)
			_ = h.repo.Delete(created.ID)
			utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to embed knowledge base content")
			return
		}
		knowledgeChunks = append(knowledgeChunks, models.KnowledgeChunk{
			KnowledgeBaseID: created.ID,
			Content:         chunk,
			Embedding:       pgvector.NewVector(vector),
			ChunkIndex:      i,
		})
	}

	if len(knowledgeChunks) > 0 {
		if err := h.repo.CreateChunks(knowledgeChunks); err != nil {
			_ = h.storage.Delete(r.Context(), s3Key)
			_ = h.repo.Delete(created.ID)
			utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to store knowledge base chunks")
			return
		}
	}

	utils.BuildJSONResponse(w, http.StatusCreated, dto.SuccessResponse[models.KnowledgeBase]{
		Data:    *created,
		Message: "Knowledge base created successfully",
	})
}

// DeleteKnowledgeBase godoc
// @Summary      Delete a knowledge base by ID
// @Tags         knowledge-bases
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  int  true  "Knowledge Base ID"
// @Success      200  {object} dto.SuccessResponse[any]
// @Failure      400  {object} dto.ErrorResponse
// @Failure      404  {object} dto.ErrorResponse
// @Failure      500  {object} dto.ErrorResponse
// @Router       /knowledge-bases/{id} [delete]
func (h *KnowledgeBaseHandler) DeleteKnowledgeBase(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid knowledge base ID")
		return
	}

	kb, err := h.repo.FindByID(uint(id))
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusNotFound, "Knowledge base not found")
		return
	}

	if err := h.storage.Delete(r.Context(), kb.S3Key); err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to delete file from storage")
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to delete knowledge base")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[any]{
		Message: "Knowledge base deleted successfully",
	})
}

func extractText(fileBytes []byte, ext string) (string, error) {
	if ext == "txt" {
		return string(fileBytes), nil
	}
	reader := bytes.NewReader(fileBytes)
	pdfReader, err := pdf.NewReader(reader, int64(len(fileBytes)))
	if err != nil {
		return "", err
	}
	var sb strings.Builder
	for i := 1; i <= pdfReader.NumPage(); i++ {
		page := pdfReader.Page(i)
		if page.V.IsNull() {
			continue
		}
		content, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		sb.WriteString(content)
	}
	return sb.String(), nil
}

func chunkText(text string, wordsPerChunk int) []string {
	words := strings.Fields(text)
	var chunks []string
	for i := 0; i < len(words); i += wordsPerChunk {
		end := i + wordsPerChunk
		if end > len(words) {
			end = len(words)
		}
		chunks = append(chunks, strings.Join(words[i:end], " "))
	}
	return chunks
}
