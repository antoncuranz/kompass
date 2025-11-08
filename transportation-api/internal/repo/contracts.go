package repo

import (
	"context"
	"kompass/internal/controller/http/v1/request"
	"kompass/internal/entity"

	"cloud.google.com/go/civil"
	"github.com/paulmach/orb/geojson"
)

type (
	FlightInformationWebAPI interface {
		RetrieveFlightLeg(ctx context.Context, date civil.Date, flightNumber string, origin *string) (entity.FlightLeg, error)
	}

	DbVendoWebAPI interface {
		LookupTrainStation(ctx context.Context, query string) (entity.TrainStation, error)
		RetrieveJourney(ctx context.Context, journey request.Train) (entity.Train, error)
		RetrievePolylines(ctx context.Context, refreshToken string) ([]geojson.FeatureCollection, error)
	}

	OpenRouteServiceWebAPI interface {
		LookupLocation(ctx context.Context, query string) (entity.GeocodeLocation, error)
		LookupDirections(ctx context.Context, start entity.Location, end entity.Location, transportatinoType entity.TransportationType) (*geojson.FeatureCollection, error)
	}

	IataLookup interface {
		LookupAirport(iata string) (entity.AirportWithTimezone, error)
		LookupAircraftName(iata string) (string, error)
		LookupAirlineName(iata string) (string, error)
	}
)
