// Package usecase implements application business logic. Each logic group in own file.
package usecase

import (
	"context"
	"kompass/internal/controller/http/v1/request"
	"kompass/internal/entity"
	"kompass/internal/repo/opentraveldata"

	"github.com/paulmach/orb/geojson"
)

//go:generate mockgen -source=contracts.go -destination=./mocks_usecase_test.go -package=usecase_test

type (
	UseCases struct {
		Geocoding Geocoding
		Flights   Flights
		Trains    Trains
		OPTD      opentraveldata.OpenTravelData
	}

	Geocoding interface {
		LookupLocation(ctx context.Context, query string) (entity.GeocodeLocation, error)
		LookupTrainStation(ctx context.Context, query string) (entity.TrainStation, error)
		LookupDirections(ctx context.Context, start entity.Location, end entity.Location, transportationType entity.TransportationType) (*geojson.FeatureCollection, error)
	}

	Flights interface {
		FindFlight(ctx context.Context, flight request.Flight) (entity.Flight, error)
	}

	Trains interface {
		LookupTrainStation(ctx context.Context, query string) (entity.TrainStation, error)
		FindTrainJourney(ctx context.Context, journey request.Train) (entity.Train, error)
	}
)
