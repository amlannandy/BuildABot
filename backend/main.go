// @title           My API
// @version         1.0
// @description     Production-ready Go REST API
// @host            localhost:8080
// @BasePath        /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"build-a-bot/config"
	"build-a-bot/handlers"
	"build-a-bot/models"
	"build-a-bot/repository"
	"build-a-bot/router"
	"build-a-bot/utils"

	_ "build-a-bot/docs"

	"build-a-bot/middleware"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	// Load config from .env
	cfg := config.Load()

	// Connect to Postgres via GORM
	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		utils.LogFatal("Failed to connect to database: %v", err)
	} else {
		utils.LogSuccess("Successfully connected to database!")
	}

	// Auto-migrate models
	// Note: use golang-migrate or Atlas for production migrations
	if err := db.AutoMigrate(&models.User{}, &models.ChatBot{}); err != nil {
		utils.LogFatal("Auto-migration failed: %v", err)
	}

	// Wire up dependencies
	userRepo := repository.NewUserRepository(db)
	chatBotRepo := repository.NewChatBotRepository(db)

	authHandler := handlers.NewAuthHandler(userRepo)
	chatBotHandler := handlers.NewChatBotHandler(chatBotRepo)

	// Build router
	r := router.New(authHandler, chatBotHandler)

	// Configure HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      middleware.CORS(cfg.AllowedOrigin)(r),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		utils.LogInfo("🚀 Server running on http://localhost:%s", cfg.Port)
		utils.LogInfo("📖 Swagger UI:  http://localhost:%s/swagger/", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			utils.LogFatal("server error: %v", err)
		}
	}()

	// Block until SIGINT or SIGTERM received
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	utils.LogInfo("Shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		utils.LogFatal("forced shutdown: %v", err)
	}
	utils.LogInfo("Server stopped.")
}
