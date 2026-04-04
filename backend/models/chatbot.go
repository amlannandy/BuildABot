package models

import (
	"time"

	"gorm.io/gorm"
)

type ChatBot struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"not null;index" json:"user_id"`
	Name        string         `gorm:"not null" json:"name"`
	Description *string        `json:"description"`
	APIKey       string         `gorm:"uniqueIndex" json:"api_key"`
	Workflow     *string        `gorm:"type:jsonb" json:"workflow"`
	Config       *string        `gorm:"type:jsonb" json:"config"`
	Integrations *string        `gorm:"type:jsonb" json:"integrations"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
