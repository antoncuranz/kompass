package v1

import (
	"kompass/internal/usecase"
	"kompass/pkg/logger"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

func NewGeocodingRoutes(apiV1Group fiber.Router, uc usecase.Geocoding, log logger.Interface) {
	r := &GeocodingV1{uc: uc, log: log, v: validator.New(validator.WithRequiredStructEnabled())}

	geocodingV1Group := apiV1Group.Group("/geocoding")

	{
		geocodingV1Group.Post("/location", r.lookupLocation)
		geocodingV1Group.Post("/station", r.lookupTrainStation)
		geocodingV1Group.Post("/directions", r.lookupDirections)
	}
}

func NewFlightRoutes(apiV1Group fiber.Router, uc usecase.Flights, log logger.Interface) {
	r := &FlightsV1{uc: uc, log: log, v: validator.New(validator.WithRequiredStructEnabled())}
	apiV1Group.Post("/flights", r.postFlight)
}

func NewTrainRoutes(apiV1Group fiber.Router, uc usecase.Trains, log logger.Interface) {
	r := &TrainsV1{uc: uc, log: log, v: validator.New(validator.WithRequiredStructEnabled())}
	apiV1Group.Post("/trains", r.postTrainJourney)
}
