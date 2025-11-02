package v1

import (
	"fmt"
	"kompass/internal/controller/http/v1/request"
	"kompass/internal/usecase"
	"kompass/pkg/logger"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type TrainsV1 struct {
	uc  usecase.Trains
	log logger.Interface
	v   *validator.Validate
}

// @Summary     Find train journey
// @ID          postTrainJourney
// @Tags  	    trains
// @Accept      json
// @Produce     json
// @Param       request body request.Train true "train journey"
// @Success     200 {object} entity.Train
// @Failure     500 {object} response.Error
// @Router      /trains [post]
func (r *TrainsV1) postTrainJourney(ctx *fiber.Ctx) error {
	body, err := ParseAndValidateRequestBody[request.Train](ctx, r.v)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, "parse request body")
	}

	transportation, err := r.uc.FindTrainJourney(ctx.Context(), *body)
	if err != nil {
		return fmt.Errorf("retrieve journey: %w", err)
	}

	return ctx.Status(http.StatusOK).JSON(transportation)
}
