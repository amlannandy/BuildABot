#!/bin/bash

# Start backend (Go)
echo "Starting backend..."
cd backend && go run main.go &
BACKEND_PID=$!

# Start frontend (Vite)
echo "Starting frontend..."
cd frontend && pnpm run dev &
FRONTEND_PID=$!

# Wait and handle Ctrl+C
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT SIGTERM

wait
