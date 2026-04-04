package router

import (
	"build-a-bot/handlers"

	"github.com/gorilla/mux"
)

func mountWhatsAppRoutes(api *mux.Router, h *handlers.IntegrationsHandler) {
	api.HandleFunc("/webhooks/whatsapp", h.VerifyWhatsAppWebhook).Methods("GET")
	api.HandleFunc("/webhooks/whatsapp", h.ReceiveWhatsAppMessage).Methods("POST")
}
