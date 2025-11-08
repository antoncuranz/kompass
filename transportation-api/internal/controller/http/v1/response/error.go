package response

import (
	"errors"
	"github.com/gofiber/fiber/v2"
)

type Error struct {
	Error  string  `json:"error"`
	Detail *string `json:"detail,omitempty" validate:"optional" extensions:"nullable"`
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	var e *fiber.Error
	if errors.As(err, &e) {
		return c.Status(e.Code).JSON(Error{
			Error: e.Error(),
		})
	}

	detailedMsg := err.Error()
	return c.Status(fiber.StatusInternalServerError).JSON(Error{
		Error:  "internal server error",
		Detail: &detailedMsg,
	})
}
