package handlers

import (
	"build-a-bot/dto"
	"build-a-bot/engine"
	"build-a-bot/integrations"
	"build-a-bot/repository"
	"build-a-bot/utils"
	"context"
	"encoding/json"
	"net/http"
)

type IntegrationsHandler struct {
	chatBotRepo repository.ChatBotRepository
	engine      *engine.Engine
	whatsapp    integrations.WhatsAppClient
	verifyToken string
}

func NewIntegrationsHandler(
	chatBotRepo repository.ChatBotRepository,
	engine *engine.Engine,
	whatsapp integrations.WhatsAppClient,
	verifyToken string,
) *IntegrationsHandler {
	return &IntegrationsHandler{
		chatBotRepo: chatBotRepo,
		engine:      engine,
		whatsapp:    whatsapp,
		verifyToken: verifyToken,
	}
}

// Verify handles the GET webhook verification handshake from Meta.
// Meta sends hub.verify_token and hub.challenge — we echo back the challenge
// if the token matches.
func (h *IntegrationsHandler) VerifyWhatsAppWebhook(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("hub.mode")
	token := r.URL.Query().Get("hub.verify_token")
	challenge := r.URL.Query().Get("hub.challenge")

	if mode == "subscribe" && token == h.verifyToken {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(challenge))
		return
	}

	utils.BuildErrorResponse(w, http.StatusForbidden, "Verification failed")
}

// Receive handles incoming WhatsApp messages sent by Meta via POST webhook.
func (h *IntegrationsHandler) ReceiveWhatsAppMessage(w http.ResponseWriter, r *http.Request) {
	var payload dto.WhatsAppPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.BuildErrorResponse(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	// Meta expects a 200 response quickly — process async to avoid timeouts
	// on long LLM calls. Use background context since the request context will
	// be cancelled as soon as we return 200.
	go h.ProcessWhatsAppPayload(payload)

	w.WriteHeader(http.StatusOK)
}

func (h *IntegrationsHandler) ProcessWhatsAppPayload(payload dto.WhatsAppPayload) {
	ctx := context.Background()

	for _, entry := range payload.Entry {
		for _, change := range entry.Changes {
			v := change.Value
			if len(v.Messages) == 0 {
				continue
			}

			phoneNumberID := v.Metadata.PhoneNumberID
			msg := v.Messages[0]
			from := msg.From
			text := msg.Text.Body

			if text == "" || phoneNumberID == "" || from == "" {
				continue
			}

			chatbot, err := h.chatBotRepo.FindByWhatsAppID(phoneNumberID)
			if err != nil {
				continue
			}

			reply, err := h.engine.Run(ctx, text, chatbot, from)
			if err != nil {
				continue
			}

			h.whatsapp.SendMessage(ctx, phoneNumberID, from, reply)
		}
	}
}
