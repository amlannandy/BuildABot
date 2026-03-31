package router

import (
	"build-a-bot/handlers"
	"net/http"

	"github.com/gorilla/mux"
)

func mountAuthRoutes(r *mux.Router, h *handlers.AuthHandler) {
	r.HandleFunc("/auth/register", h.Register).Methods(http.MethodPost)
	r.HandleFunc("/auth/login", h.Login).Methods(http.MethodPost)
}

func mountProtectedAuthRoutes(r *mux.Router, h *handlers.AuthHandler) {
	r.HandleFunc("/auth/current-user", h.GetCurrentUser).Methods(http.MethodGet)
}
