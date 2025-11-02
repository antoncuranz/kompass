package geocoding

import (
	"context"
	"fmt"
	"kompass/internal/entity"
	"kompass/internal/repo"
	"kompass/internal/usecase"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

type UseCase struct {
	trains usecase.Trains
	ors    repo.OpenRouteServiceWebAPI
}

func New(trains usecase.Trains, ors repo.OpenRouteServiceWebAPI) *UseCase {
	return &UseCase{
		trains: trains,
		ors:    ors,
	}
}

func (uc *UseCase) LookupLocation(ctx context.Context, query string) (entity.GeocodeLocation, error) {
	location, err := uc.ors.LookupLocation(ctx, query)
	if err != nil {
		return entity.GeocodeLocation{}, fmt.Errorf("lookup location: %w", err)
	}

	return location, nil
}

func (uc *UseCase) LookupTrainStation(ctx context.Context, query string) (entity.TrainStation, error) {
	station, err := uc.trains.LookupTrainStation(ctx, query)
	if err != nil {
		return entity.TrainStation{}, fmt.Errorf("lookup trainstation: %w", err)
	}

	return station, nil
}

func (uc *UseCase) LookupDirections(ctx context.Context, start entity.Location, end entity.Location, transportationType entity.TransportationType) (*geojson.FeatureCollection, error) {
	featureCollection, err := uc.ors.LookupDirections(ctx, start, end, transportationType)
	if err != nil {
		return nil, fmt.Errorf("lookup directions: %w", err)
	}

	featureCollection.ExtraMembers = map[string]interface{}{"transportationType": transportationType}
	featureCollection.Append(geojson.NewFeature(locationToPoint(start)))
	featureCollection.Append(geojson.NewFeature(locationToPoint(end)))
	
	return featureCollection, nil
}

func locationToPoint(location entity.Location) orb.Point {
	return orb.Point{
		float64(location.Longitude),
		float64(location.Latitude),
	}
}
