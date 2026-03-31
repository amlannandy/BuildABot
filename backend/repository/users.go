package repository

import (
	"build-a-bot/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindAll() ([]models.User, error)
	FindByID(id uint) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	Create(user *models.User) (*models.User, error)
	Update(user *models.User) (*models.User, error)
	Delete(id uint) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) FindAll() ([]models.User, error) {
	var users []models.User
	result := r.db.Find(&users)
	return users, result.Error
}

func (r *userRepo) FindByID(id uint) (*models.User, error) {
	var user models.User
	result := r.db.First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepo) FindByEmail(email string) (*models.User, error) {
	var user models.User
	result := r.db.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (r *userRepo) Create(user *models.User) (*models.User, error) {
	result := r.db.Create(user)
	return user, result.Error
}

func (r *userRepo) Update(user *models.User) (*models.User, error) {
	result := r.db.Save(user)
	return user, result.Error
}

func (r *userRepo) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}
