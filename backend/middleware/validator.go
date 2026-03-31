package middleware

import (
	"build-a-bot/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func ValidateBody[T any](next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			utils.BuildErrorResponse(w, http.StatusBadRequest, "Failed to read request body")
			return
		}
		r.Body = io.NopCloser(bytes.NewReader(bodyBytes))

		var body T
		if err := json.Unmarshal(bodyBytes, &body); err != nil {
			utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid JSON")
			return
		}

		if err := validate.Struct(body); err != nil {
			var errs []string
			for _, e := range err.(validator.ValidationErrors) {
				var msg string
				switch e.Tag() {
				case "required":
					msg = fmt.Sprintf("%s is required", e.Field())
				case "email":
					msg = fmt.Sprintf("%s must be a valid email address", e.Field())
				case "min":
					msg = fmt.Sprintf("%s must be at least %s characters", e.Field(), e.Param())
				case "max":
					msg = fmt.Sprintf("%s must be at most %s characters", e.Field(), e.Param())
				default:
					msg = fmt.Sprintf("%s is invalid", e.Field())
				}
				errs = append(errs, msg)
			}
			utils.BuildErrorResponse(w, http.StatusUnprocessableEntity, errs...)
			return
		}

		next.ServeHTTP(w, r)
	})
}
