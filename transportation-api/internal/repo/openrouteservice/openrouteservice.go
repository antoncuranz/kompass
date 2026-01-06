package openrouteservice

import (
	"context"
	"fmt"
	"kompass/config"
	"kompass/internal/entity"
	"kompass/internal/repo"
	"net/url"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

type OpenRouteServiceWebAPI struct {
	baseURL string
	apiKey  string
}

func New(config config.WebApi) *OpenRouteServiceWebAPI {
	return &OpenRouteServiceWebAPI{
		baseURL: config.OpenRouteServiceBaseURL,
		apiKey:  config.OpenRouteServiceApiKey,
	}
}

func (a *OpenRouteServiceWebAPI) LookupLocation(ctx context.Context, query string) (entity.GeocodeLocation, error) {
	urlFormat := "%s/geocode/search?api_key=%s&size=1&text=%s"
	searchUrl := fmt.Sprintf(urlFormat, a.baseURL, a.apiKey, url.QueryEscape(query))

	result, err := repo.RequestAndParseJsonBody[geojson.FeatureCollection](ctx, "GET", searchUrl, nil)
	if err != nil {
		return entity.GeocodeLocation{}, fmt.Errorf("requestAndParseJsonBody: %w", err)
	}

	if len(result.Features) == 0 {
		return entity.GeocodeLocation{}, fmt.Errorf("no train stations found")
	}
	feature := result.Features[0]
	point := feature.Geometry.(orb.Point)

	return entity.GeocodeLocation{
		Label:     feature.Properties["label"].(string),
		Latitude:  float32(point[1]),
		Longitude: float32(point[0]),
	}, nil
}

func (a *OpenRouteServiceWebAPI) LookupDirections(ctx context.Context, start entity.Location, end entity.Location, transportationType entity.TransportationType) (*geojson.FeatureCollection, error) {
	profile := getProfileByTransportationType(transportationType)
	urlFormat := "%s/v2/directions/%s?api_key=%s&start=%f,%f&end=%f,%f"
	directionsUrl := fmt.Sprintf(urlFormat, a.baseURL, profile, a.apiKey, start.Longitude, start.Latitude, end.Longitude, end.Latitude)

	featureCollection, err := repo.RequestAndParseJsonBody[geojson.FeatureCollection](ctx, "GET", directionsUrl, nil)
	if err != nil {
		return nil, fmt.Errorf("requestAndParseJsonBody: %w", err)
	}

	return featureCollection, nil
}

func getProfileByTransportationType(transportationType entity.TransportationType) string {
	switch transportationType {
	case entity.BIKE:
		return "cycling-regular"
	case entity.HIKE:
		return "foot-hiking"
	default:
		return "driving-car"
	}
}
