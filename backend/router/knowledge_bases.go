package router

import (
	"net/http"

	"build-a-bot/handlers"
	"build-a-bot/middleware"

	"github.com/gorilla/mux"
)

func mountKnowledgeBaseRoutes(r *mux.Router, h *handlers.KnowledgeBaseHandler) {
	r.Handle("/knowledge-bases/list",
		middleware.JWTAuth(http.HandlerFunc(h.ListKnowledgeBases)),
	).Methods(http.MethodPost)

	r.Handle("/knowledge-bases/create",
		middleware.JWTAuth(http.HandlerFunc(h.CreateKnowledgeBase)),
	).Methods(http.MethodPost)

	r.Handle("/knowledge-bases/{id}",
		middleware.JWTAuth(http.HandlerFunc(h.DeleteKnowledgeBase)),
	).Methods(http.MethodDelete)
}
