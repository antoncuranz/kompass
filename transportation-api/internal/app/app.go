// Package app configures and runs application.
package app

import (
	"fmt"
	"kompass/internal/controller/http/v1/response"
	"kompass/internal/repo/amadeus"
	"kompass/internal/repo/dbvendo"
	"kompass/internal/repo/openrouteservice"
	"kompass/internal/repo/opentraveldata"
	"kompass/internal/usecase"
	"kompass/internal/usecase/flights"
	"kompass/internal/usecase/geocoding"
	"kompass/internal/usecase/trains"
	"os"
	"os/signal"
	"syscall"

	"kompass/config"
	"kompass/internal/controller/http"
	"kompass/pkg/httpserver"
	"kompass/pkg/logger"
)

func Run(cfg *config.Config) {
	log := logger.New(cfg.Log.Level)

	// Use-Case
	useCases := createUseCases(cfg)

	// HTTP Server
	httpServer := httpserver.New(
		httpserver.Port(cfg.HTTP.Port),
		httpserver.Prefork(cfg.HTTP.UsePreforkMode),
		httpserver.ErrorHandler(response.ErrorHandler),
	)
	http.NewRouter(httpServer.App, cfg, useCases, log)
	httpServer.Start()

	// Waiting signal
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	select {
	case s := <-interrupt:
		log.Info("app - Run - signal: %s", s.String())
	case err := <-httpServer.Notify():
		log.Error(fmt.Errorf("app - Run - httpServer.Notify: %w", err))
	}

	// Shutdown
	err := httpServer.Shutdown()
	if err != nil {
		log.Error(fmt.Errorf("app - Run - httpServer.Shutdown: %w", err))
	}
}

func createUseCases(cfg *config.Config) usecase.UseCases {
	ors := openrouteservice.New(cfg.WebApi)
	optd := opentraveldata.New(cfg.WebApi)

	flightsUseCase := flights.New(amadeus.New(cfg.WebApi, optd))
	trainsUseCase := trains.New(dbvendo.New(cfg.WebApi))
	geocodingUseCase := geocoding.New(trainsUseCase, ors)

	return usecase.UseCases{
		Geocoding: geocodingUseCase,
		Flights:   flightsUseCase,
		Trains:    trainsUseCase,
	}
}
