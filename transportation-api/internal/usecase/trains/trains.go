package trains

import (
	"context"
	"fmt"
	"kompass/internal/controller/http/v1/request"
	"kompass/internal/entity"
	"kompass/internal/repo"
)

type UseCase struct {
	dbVendo repo.DbVendoWebAPI
}

func New(api repo.DbVendoWebAPI) *UseCase {
	return &UseCase{
		dbVendo: api,
	}
}

func (uc *UseCase) LookupTrainStation(ctx context.Context, query string) (entity.TrainStation, error) {
	return uc.dbVendo.LookupTrainStation(ctx, query)
}

func (uc *UseCase) FindTrainJourney(ctx context.Context, request request.Train) (entity.Train, error) {
	train, err := uc.dbVendo.RetrieveJourney(ctx, request)
	if err != nil {
		return entity.Train{}, fmt.Errorf("failed to retrieve journey: %w", err)
	}

	train.GeoJson, err = uc.createGeoJson(ctx, train)
	if err != nil {
		return entity.Train{}, fmt.Errorf("failed to create geojson: %w", err)
	}

	return train, nil
}
