package v1

import (
	"errors"
	"fmt"
	"kompass/internal/controller/http/v1/request"
	"kompass/internal/entity"
	"kompass/internal/usecase"
	"kompass/pkg/logger"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type FlightsV1 struct {
	uc  usecase.Flights
	log logger.Interface
	v   *validator.Validate
}

// @Summary     Find flight
// @ID          postFlight
// @Tags  	    flights
// @Accept      json
// @Produce     json
// @Param       request body request.Flight true "flight"
// @Success     200 {object} entity.Flight
// @Failure     422 {object} entity.ErrAmbiguousFlightRequest
// @Failure     500 {object} response.Error
// @Router      /flights [post]
func (r *FlightsV1) postFlight(ctx *fiber.Ctx) error {
	body, err := ParseAndValidateRequestBody[request.Flight](ctx, r.v)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid request body")
	}

	transportation, err := r.uc.FindFlight(ctx.UserContext(), *body)
	if err != nil {
		var ambiguousError entity.ErrAmbiguousFlightRequest
		if errors.As(err, &ambiguousError) {
			return ctx.Status(http.StatusUnprocessableEntity).JSON(ambiguousError)
		}
		return fmt.Errorf("create flight: %w", err)
	}

	return ctx.Status(http.StatusOK).JSON(transportation)
}
