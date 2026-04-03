package config

import (
	"build-a-bot/utils"
	"fmt"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseHost     string
	DatabasePort     string
	DatabaseUser     string
	DatabasePassword string
	DatabaseName     string
	Port             string
	JWTSecret        string
	AllowedOrigin    string
	AnthropicAPIKey  string
	OpenAIAPIKey     string
	S3Bucket         string
	S3Region         string
	AWSAccessKey     string
	AWSSecretKey     string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		utils.LogFatal(".env file not found.")
	}
	return &Config{
		DatabaseHost:     utils.GetEnvironmentVariable("DB_HOST"),
		DatabasePort:     utils.GetEnvironmentVariable("DB_PORT"),
		DatabaseUser:     utils.GetEnvironmentVariable("DB_USER"),
		DatabasePassword: utils.GetEnvironmentVariable("DB_PASSWORD"),
		DatabaseName:     utils.GetEnvironmentVariable("DB_NAME"),
		Port:             utils.GetEnvironmentVariable("PORT"),
		JWTSecret:        utils.GetEnvironmentVariable("JWT_SECRET"),
		AllowedOrigin:    utils.GetEnvironmentVariable("ALLOWED_ORIGIN"),
		AnthropicAPIKey:  utils.GetEnvironmentVariable("ANTHROPIC_API_KEY"),
		OpenAIAPIKey:     utils.GetEnvironmentVariable("OPENAI_API_KEY"),
		S3Bucket:         utils.GetEnvironmentVariable("S3_BUCKET"),
		S3Region:         utils.GetEnvironmentVariable("S3_REGION"),
		AWSAccessKey:     utils.GetEnvironmentVariable("AWS_ACCESS_KEY"),
		AWSSecretKey:     utils.GetEnvironmentVariable("AWS_SECRET_KEY"),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
		c.DatabaseHost, c.DatabasePort, c.DatabaseUser, c.DatabasePassword, c.DatabaseName,
	)
}
