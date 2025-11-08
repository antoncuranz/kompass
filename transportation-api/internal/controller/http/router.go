package http

import (
	"kompass/internal/usecase"
	"net/http"

	fiberSwagger "github.com/swaggo/fiber-swagger"

	"kompass/config"
	_ "kompass/docs" // Swagger docs.
	"kompass/internal/controller/http/middleware"
	v1 "kompass/internal/controller/http/v1"
	"kompass/pkg/logger"

	"github.com/ansrivas/fiberprometheus/v2"
	"github.com/gofiber/fiber/v2"
)

// NewRouter -.
// Swagger spec:
// @title       Kompass Transportation API
// @version     1.0
// @servers.url http://127.0.0.1:8080/api/v1
func NewRouter(app *fiber.App, cfg *config.Config, useCases usecase.UseCases, log logger.Interface) {
	// Options
	app.Use(middleware.Logger())
	app.Use(middleware.Recovery(log))

	// Prometheus metrics
	if cfg.Metrics.Enabled {
		prometheus := fiberprometheus.New("my-service-name")
		prometheus.RegisterAt(app, "/metrics")
		app.Use(prometheus.Middleware)
	}

	// Swagger
	if cfg.Swagger.Enabled {
		app.Get("/swagger/*", fiberSwagger.WrapHandler)
	}

	// K8s probe
	app.Get("/healthz", func(ctx *fiber.Ctx) error { return ctx.SendStatus(http.StatusOK) })

	// Routers
	apiV1Group := app.Group("/api/v1")
	{
		v1.NewGeocodingRoutes(apiV1Group, useCases.Geocoding, log)
		v1.NewFlightRoutes(apiV1Group, useCases.Flights, log)
		v1.NewTrainRoutes(apiV1Group, useCases.Trains, log)
	}
}
