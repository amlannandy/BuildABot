package repository

import (
	"build-a-bot/models"

	"gorm.io/gorm"
)

type ChatBotRepository interface {
	FindAllByUserID(userID uint) ([]models.ChatBot, error)
	FindByID(id uint) (*models.ChatBot, error)
	Create(chatBot *models.ChatBot) (*models.ChatBot, error)
	Update(chatBot *models.ChatBot) (*models.ChatBot, error)
	Delete(id uint) error
}

type chatBotRepo struct {
	db *gorm.DB
}

func NewChatBotRepository(db *gorm.DB) ChatBotRepository {
	return &chatBotRepo{db: db}
}

func (r *chatBotRepo) FindAllByUserID(userID uint) ([]models.ChatBot, error) {
	var chatBots []models.ChatBot
	result := r.db.Where("user_id = ?", userID).Find(&chatBots)
	return chatBots, result.Error
}

func (r *chatBotRepo) FindByID(id uint) (*models.ChatBot, error) {
	var chatBot models.ChatBot
	result := r.db.First(&chatBot, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &chatBot, nil
}

func (r *chatBotRepo) Create(chatBot *models.ChatBot) (*models.ChatBot, error) {
	result := r.db.Create(chatBot)
	return chatBot, result.Error
}

func (r *chatBotRepo) Update(chatBot *models.ChatBot) (*models.ChatBot, error) {
	result := r.db.Save(chatBot)
	return chatBot, result.Error
}

func (r *chatBotRepo) Delete(id uint) error {
	result := r.db.Delete(&models.ChatBot{}, id)
	return result.Error
}
