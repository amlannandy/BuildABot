package models

type Integrations struct {
	WhatsApp *WhatsAppIntegration `json:"whatsapp,omitempty"`
}

type WhatsAppIntegration struct {
	PhoneNumberID string `json:"phone_number_id"`
}
