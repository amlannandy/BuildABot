package dto

type WhatsAppPayload struct {
	Object string          `json:"object"`
	Entry  []WhatsAppEntry `json:"entry"`
}

type WhatsAppEntry struct {
	Changes []WhatsAppChange `json:"changes"`
}

type WhatsAppChange struct {
	Value WhatsAppValue `json:"value"`
}

type WhatsAppValue struct {
	Metadata WhatsAppMetadata  `json:"metadata"`
	Messages []WhatsAppMessage `json:"messages"`
}

type WhatsAppMetadata struct {
	PhoneNumberID string `json:"phone_number_id"`
}

type WhatsAppMessage struct {
	From string       `json:"from"`
	Text WhatsAppText `json:"text"`
}

type WhatsAppText struct {
	Body string `json:"body"`
}
