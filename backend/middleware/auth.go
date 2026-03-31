package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"build-a-bot/utils"

	"github.com/golang-jwt/jwt/v5"
)

const (
	UserIDKey string = "userID"
)

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			utils.LogWarn("Missing or malformed Authorization header")
			utils.BuildErrorResponse(w, http.StatusUnauthorized, "Missing or malformed token")
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			utils.LogWarn("JWTAuth: invalid or expired token — %v", err)
			utils.BuildErrorResponse(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		ctx := context.WithValue(r.Context(), UserIDKey, claims["sub"])
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
