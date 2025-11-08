package middleware

import (
	"github.com/gofiber/fiber/v2"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"
)

func Logger() func(c *fiber.Ctx) error {
	return fiberLogger.New()
}
