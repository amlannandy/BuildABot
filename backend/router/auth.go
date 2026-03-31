package router

import (
	"build-a-bot/dto"
	"build-a-bot/handlers"
	"build-a-bot/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

func mountAuthRoutes(r *mux.Router, h *handlers.AuthHandler) {
	r.Handle("/auth/register",
		middleware.ValidateBody[dto.RegisterRequest](http.HandlerFunc(h.Register)),
	).Methods(http.MethodPost)
	r.Handle("/auth/login",
		middleware.ValidateBody[dto.LoginRequest](http.HandlerFunc(h.Login)),
	).Methods(http.MethodPost)
	r.Handle("/auth/current-user", middleware.JWTAuth(http.HandlerFunc(h.GetCurrentUser))).Methods(http.MethodGet)
}
