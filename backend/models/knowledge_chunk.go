package models

import (
	"github.com/pgvector/pgvector-go"
)

type KnowledgeChunk struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	KnowledgeBaseID uint           `gorm:"not null;index" json:"knowledge_base_id"`
	Content         string         `gorm:"not null;type:text" json:"content"`
	Embedding       pgvector.Vector `gorm:"not null;type:vector(1536)" json:"-"`
	ChunkIndex      int            `gorm:"not null" json:"chunk_index"`
}
