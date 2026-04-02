package utils

import (
	"build-a-bot/dto"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"os"

	"github.com/golang-jwt/jwt/v5"
)

func GetEnvironmentVariable(key string) string {
	environmentValue := os.Getenv(key)
	if environmentValue == "" {
		LogError("Value not set for %v in .env file", environmentValue)
	}
	return environmentValue
}

func GenerateJWT(userID uint) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func BuildJSONResponse[T any](w http.ResponseWriter, status int, payload dto.SuccessResponse[T]) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func BuildErrorResponse(w http.ResponseWriter, status int, msgs ...string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(dto.ErrorResponse{Errors: msgs})
}

func GenerateAPIKey() (*string, bool) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		LogError("Failed to generate API key: %v", err)
		return nil, false
	}
	key := hex.EncodeToString(bytes)
	return &key, true
}
