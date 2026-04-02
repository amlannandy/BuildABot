package models

import (
	"time"

	"gorm.io/gorm"
)

type FileType string

const (
	FileTypeTxt FileType = "txt"
	FileTypePDF FileType = "pdf"
)

type KnowledgeBase struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	ChatBotID uint           `gorm:"not null;index" json:"chatbot_id"`
	Name      string         `gorm:"not null" json:"name"`
	FileName  string         `gorm:"not null" json:"file_name"`
	S3Key     string         `gorm:"not null" json:"s3_key"`
	FileType  FileType       `gorm:"not null" json:"file_type"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
