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

type GeocodingV1 struct {
	uc  usecase.Geocoding
	log logger.Interface
	v   *validator.Validate
}

// @Summary     Lookup location
// @ID          lookupLocation
// @Tags  	    geocoding
// @Produce     json
// @Param       query query string true "location query"
// @Success     200 {object} entity.Location
// @Failure     500 {object} response.Error
// @Router      /geocoding/location [post]
func (r *GeocodingV1) lookupLocation(ctx *fiber.Ctx) error {
	query := ctx.Query("query")
	location, err := r.uc.LookupLocation(ctx.Context(), query)
	if err != nil {
		return fmt.Errorf("lookup location: %w", err)
	}

	return ctx.Status(http.StatusOK).JSON(location)
}

// @Summary     Lookup train station
// @ID          lookupTrainStation
// @Tags  	    geocoding
// @Produce     json
// @Param       query query string true "station query"
// @Success     200 {object} entity.TrainStation
// @Failure     500 {object} response.Error
// @Router      /geocoding/station [post]
func (r *GeocodingV1) lookupTrainStation(ctx *fiber.Ctx) error {
	query := ctx.Query("query")
	station, err := r.uc.LookupTrainStation(ctx.Context(), query)
	if err != nil {
		return fmt.Errorf("lookup trainstation: %w", err)
	}

	return ctx.Status(http.StatusOK).JSON(station)
}

// @Summary     Lookup directions
// @ID          lookupDirections
// @Tags  	    geocoding
// @Accept      json
// @Produce     json
// @Param       request body request.Directions true "directions request"
// @Success     200 {object} geojson.FeatureCollection
// @Failure     400 {object} response.Error
// @Failure     500 {object} response.Error
// @Router      /geocoding/directions [post]
func (r *GeocodingV1) lookupDirections(ctx *fiber.Ctx) error {
	body, err := ParseAndValidateRequestBody[request.Directions](ctx, r.v)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid request body")
	}

	directions, err := r.uc.LookupDirections(ctx.Context(), body.Start, body.End, body.TransportationType)
	if err != nil {
		return fmt.Errorf("lookup directions: %w", err)
	}

	return ctx.Status(http.StatusOK).JSON(directions)
}
