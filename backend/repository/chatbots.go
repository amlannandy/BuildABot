package repository

import (
	"build-a-bot/models"

	"gorm.io/gorm"
)

type ChatBotListParams struct {
	UserID      uint
	Limit       int
	Offset      int
	NameFilter  *string
	DescFilter  *string
}

type ChatBotRepository interface {
	FindAllByUserID(userID uint) ([]models.ChatBot, error)
	FindPaginated(params ChatBotListParams) ([]models.ChatBot, int64, error)
	FindByID(id uint) (*models.ChatBot, error)
	FindByWhatsAppID(phoneNumberID string) (*models.ChatBot, error)
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

func (r *chatBotRepo) FindPaginated(params ChatBotListParams) ([]models.ChatBot, int64, error) {
	var chatBots []models.ChatBot
	var total int64

	query := r.db.Model(&models.ChatBot{}).Where("user_id = ?", params.UserID)

	if params.NameFilter != nil && *params.NameFilter != "" {
		query = query.Where("name ILIKE ?", "%"+*params.NameFilter+"%")
	}
	if params.DescFilter != nil && *params.DescFilter != "" {
		query = query.Where("description ILIKE ?", "%"+*params.DescFilter+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Limit(params.Limit).Offset(params.Offset).Find(&chatBots).Error; err != nil {
		return nil, 0, err
	}

	return chatBots, total, nil
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

func (r *chatBotRepo) FindByWhatsAppID(phoneNumberID string) (*models.ChatBot, error) {
	var chatBot models.ChatBot
	result := r.db.Where("integrations->'whatsapp'->>'phone_number_id' = ?", phoneNumberID).First(&chatBot)
	if result.Error != nil {
		return nil, result.Error
	}
	return &chatBot, nil
}

func (r *chatBotRepo) Delete(id uint) error {
	result := r.db.Delete(&models.ChatBot{}, id)
	return result.Error
}
