package models

import (
	"time"

	"gorm.io/gorm"
)

type HistoryMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Session struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	ChatBotID      uint           `gorm:"not null;index" json:"chat_bot_id"`
	UserIdentifier string         `gorm:"not null;index" json:"user_identifier"`
	CurrentNodeID  *string        `gorm:"type:text" json:"current_node_id"`
	Variables      *string        `gorm:"type:jsonb" json:"variables"`
	History        *string        `gorm:"type:jsonb" json:"history"`
	ExpiresAt      time.Time      `gorm:"not null" json:"expires_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
