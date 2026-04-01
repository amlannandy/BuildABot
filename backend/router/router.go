package router

import (
	"net/http"

	"build-a-bot/handlers"
	"build-a-bot/middleware"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

func New(authHandler *handlers.AuthHandler, chatBotHandler *handlers.ChatBotHandler) http.Handler {
	r := mux.NewRouter()
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	api := r.PathPrefix("/api/v1").Subrouter()

	protected := api.NewRoute().Subrouter()
	protected.Use(middleware.JWTAuth)

	mountAuthRoutes(api, authHandler)
	mountChatBotRoutes(api, chatBotHandler)

	return r
}
