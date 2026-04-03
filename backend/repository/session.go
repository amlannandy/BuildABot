package repository

import (
	"build-a-bot/models"
	"time"

	"gorm.io/gorm"
)

type SessionRepository interface {
	Create(session *models.Session) (*models.Session, error)
	FindActive(chatBotID uint, userIdentifier string) (*models.Session, error)
	Update(session *models.Session) (*models.Session, error)
	Delete(id uint) error
}

type sessionRepo struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) SessionRepository {
	return &sessionRepo{db: db}
}

func (r *sessionRepo) Create(session *models.Session) (*models.Session, error) {
	result := r.db.Create(session)
	return session, result.Error
}

// FindActive returns the active (non-expired) session for a given chatbot + user.
// Returns nil (no error) if no active session exists.
func (r *sessionRepo) FindActive(chatBotID uint, userIdentifier string) (*models.Session, error) {
	var session models.Session
	result := r.db.
		Where("chatbot_id = ? AND user_identifier = ? AND expires_at > ?", chatBotID, userIdentifier, time.Now()).
		First(&session)

	if result.Error == gorm.ErrRecordNotFound {
		return nil, nil
	}
	if result.Error != nil {
		return nil, result.Error
	}
	return &session, nil
}

func (r *sessionRepo) Update(session *models.Session) (*models.Session, error) {
	result := r.db.Save(session)
	return session, result.Error
}

func (r *sessionRepo) Delete(id uint) error {
	return r.db.Delete(&models.Session{}, id).Error
}
