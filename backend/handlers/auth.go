package handlers

import (
	"encoding/json"
	"net/http"

	"build-a-bot/dto"
	"build-a-bot/middleware"
	"build-a-bot/models"
	"build-a-bot/repository"
	"build-a-bot/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	repo repository.UserRepository
}

func NewAuthHandler(repo repository.UserRepository) *AuthHandler {
	return &AuthHandler{repo: repo}
}

// Register godoc
// @Summary      Register a new user
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body dto.RegisterRequest true "Register payload"
// @Success      201  {object} dto.AuthResponse
// @Failure      400  {object} map[string]string
// @Router       /auth/register [post]
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Check if email is already registered
	existing, _ := h.repo.FindByEmail(req.Email)
	if existing != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Email is already registered")
		return
	}

	// Hash the password before saving
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashed),
	}
	created, err := h.repo.Create(user)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Generate JWT token for the newly registered user
	token, err := utils.GenerateJWT(created.ID)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	utils.BuildJSONResponse(w, http.StatusCreated, dto.SuccessResponse[string]{
		Data:    token,
		Message: "User successfully registered",
	})
}

// Login godoc
// @Summary      Login
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body dto.LoginRequest true "Login payload"
// @Success      200  {object} dto.AuthResponse
// @Failure      401  {object} map[string]string
// @Router       /auth/login [post]
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Check if user exists
	user, err := h.repo.FindByEmail(req.Email)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Compare the provided password with the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.BuildErrorResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Generate JWT token for the authenticated user
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[string]{
		Data:    token,
		Message: "User successfully logged in",
	})
}

// GetCurrentUser godoc
// @Summary      Get current authenticated user
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object} models.User
// @Failure      401  {object} map[string]string
// @Router       /auth/current-user [get]
func (h *AuthHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userId := uint(r.Context().Value(middleware.UserIDKey).(float64))
	user, err := h.repo.FindByID(userId)
	if err != nil {
		utils.BuildErrorResponse(w, http.StatusUnauthorized, "User not authenticated")
		return
	}
	utils.BuildJSONResponse(w, http.StatusOK, dto.SuccessResponse[models.User]{
		Data:    *user,
		Message: "Current user retrieved",
	})
}
