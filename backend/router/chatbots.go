package router

import (
	"build-a-bot/handlers"
	"build-a-bot/middleware"
	"net/http"

	"github.com/gorilla/mux"
)

func mountChatBotRoutes(r *mux.Router, h *handlers.ChatBotHandler) {
	r.Handle("/chatbots/create", middleware.JWTAuth(http.HandlerFunc(h.CreateChatBot))).Methods(http.MethodPost)
}
