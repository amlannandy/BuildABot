package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/fatih/color"
)

var (
	successPrinter = color.New(color.FgGreen, color.Bold)
	errorPrinter   = color.New(color.FgRed, color.Bold)
	warnPrinter    = color.New(color.FgYellow, color.Bold)
	infoPrinter    = color.New(color.FgCyan)
)

func timestamp() string {
	return time.Now().Format("15:04:05")
}

func LogSuccess(msg string, args ...any) {
	successPrinter.Printf("[%s] ✓ %s\n", timestamp(), fmt.Sprintf(msg, args...))
}

func LogError(msg string, args ...any) {
	errorPrinter.Printf("[%s] ✗ %s\n", timestamp(), fmt.Sprintf(msg, args...))
}

func LogWarn(msg string, args ...any) {
	warnPrinter.Printf("[%s] ⚠ %s\n", timestamp(), fmt.Sprintf(msg, args...))
}

func LogInfo(msg string, args ...any) {
	infoPrinter.Printf("[%s] ℹ %s\n", timestamp(), fmt.Sprintf(msg, args...))
}

func LogFatal(msg string, args ...any) {
	errorPrinter.Printf("[%s] ✗ FATAL: %s\n", timestamp(), fmt.Sprintf(msg, args...))
	os.Exit(1)
}
