package repository

import (
	"build-a-bot/models"

	"github.com/pgvector/pgvector-go"
	"gorm.io/gorm"
)

type KnowledgeBaseRepository interface {
	Create(kb *models.KnowledgeBase) (*models.KnowledgeBase, error)
	FindByID(id uint) (*models.KnowledgeBase, error)
	FindByChatBotID(chatBotID uint) ([]models.KnowledgeBase, error)
	Delete(id uint) error
	CreateChunks(chunks []models.KnowledgeChunk) error
	FindSimilarChunks(kbID uint, vector pgvector.Vector, topN int) ([]models.KnowledgeChunk, error)
}

type knowledgeBaseRepo struct {
	db *gorm.DB
}

func NewKnowledgeBaseRepository(db *gorm.DB) KnowledgeBaseRepository {
	return &knowledgeBaseRepo{db: db}
}

func (r *knowledgeBaseRepo) Create(kb *models.KnowledgeBase) (*models.KnowledgeBase, error) {
	result := r.db.Create(kb)
	return kb, result.Error
}

func (r *knowledgeBaseRepo) FindByID(id uint) (*models.KnowledgeBase, error) {
	var kb models.KnowledgeBase
	result := r.db.First(&kb, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &kb, nil
}

func (r *knowledgeBaseRepo) FindByChatBotID(chatBotID uint) ([]models.KnowledgeBase, error) {
	var kbs []models.KnowledgeBase
	result := r.db.Where("chatbot_id = ?", chatBotID).Find(&kbs)
	return kbs, result.Error
}

func (r *knowledgeBaseRepo) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("knowledge_base_id = ?", id).Delete(&models.KnowledgeChunk{}).Error; err != nil {
			return err
		}
		return tx.Delete(&models.KnowledgeBase{}, id).Error
	})
}

func (r *knowledgeBaseRepo) CreateChunks(chunks []models.KnowledgeChunk) error {
	return r.db.Create(&chunks).Error
}

func (r *knowledgeBaseRepo) FindSimilarChunks(kbID uint, vector pgvector.Vector, topN int) ([]models.KnowledgeChunk, error) {
	var chunks []models.KnowledgeChunk
	result := r.db.
		Where("knowledge_base_id = ?", kbID).
		Order(gorm.Expr("embedding <=> ?", vector)).
		Limit(topN).
		Find(&chunks)
	return chunks, result.Error
}
