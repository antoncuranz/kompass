package dbvendo

import (
	"context"
	"fmt"
	"kompass/config"
	"kompass/internal/controller/http/v1/request"
	"kompass/internal/entity"
	"kompass/internal/repo"
	"kompass/internal/repo/dbvendo/converter"
	"kompass/internal/repo/dbvendo/response"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/paulmach/orb/geojson"
)

type DbVendoWebAPI struct {
	baseURL string
	c       converter.TrainConverter
}

func New(config config.WebApi) *DbVendoWebAPI {
	return &DbVendoWebAPI{
		baseURL: config.DbVendoBaseURL,
		c:       &converter.TrainConverterImpl{},
	}
}

func (a *DbVendoWebAPI) LookupTrainStation(ctx context.Context, query string) (entity.TrainStation, error) {
	urlFormat := "%s/locations?query=%s&poi=false"
	locationsUrl := fmt.Sprintf(urlFormat, a.baseURL, url.QueryEscape(query))

	results, err := repo.RequestAndParseJsonBody[[]response.StationOrStop](ctx, "GET", locationsUrl, nil)
	if err != nil {
		return entity.TrainStation{}, fmt.Errorf("requestAndParseJsonBody: %w", err)
	}

	if len(*results) == 0 {
		return entity.TrainStation{}, fmt.Errorf("no train stations found")
	}

	return a.c.ConvertStation((*results)[0]), nil
}

func (a *DbVendoWebAPI) RetrievePolylines(ctx context.Context, refreshToken string) ([]geojson.FeatureCollection, error) {
	urlFormat := "%s/journeys/%s?polylines=true"
	url := fmt.Sprintf(urlFormat, a.baseURL, refreshToken)

	rsp, err := repo.RequestAndParseJsonBody[response.JourneyResponse](ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("requestAndParseJsonBody: %w", err)
	}

	featureCollections := []geojson.FeatureCollection{}

	for _, leg := range rsp.Journey.Legs {
		if leg.Polyline != nil {
			featureCollections = append(featureCollections, *leg.Polyline)
		}
	}

	return featureCollections, nil
}

const MaxRetries = 10

func (a *DbVendoWebAPI) RetrieveJourney(ctx context.Context, request request.Train) (entity.Train, error) {
	journeys, err := repo.RequestAndParseJsonBody[response.JourneysResponse](ctx, "GET", a.journeyUrl(request, nil), nil)
	if err != nil {
		return entity.Train{}, fmt.Errorf("retrieveJourneysInitial: %w", err)
	}

	journey, ok := checkJourneys(journeys.Journeys, request)
	if ok {
		return a.convertJourney(journey)
	}

	for range MaxRetries {
		journeys, err = repo.RequestAndParseJsonBody[response.JourneysResponse](ctx, "GET", a.journeyUrl(request, &journeys.LaterRef), nil)
		if err != nil {
			return entity.Train{}, fmt.Errorf("retrieveJourneysLaterThan: %w", err)
		}

		journey, ok := checkJourneys(journeys.Journeys, request)
		if ok {
			return a.convertJourney(journey)
		}
	}

	return entity.Train{}, fmt.Errorf("no journeys found after %d tries", MaxRetries)
}

func (a *DbVendoWebAPI) journeyUrl(journey request.Train, laterThan *string) string {
	params := url.Values{
		"from":      {journey.FromStationID},
		"to":        {journey.ToStationID},
		"transfers": {strconv.Itoa(len(journey.TrainNumbers) - 1)},
		"results":   {"10"},
	}
	if laterThan != nil {
		params.Add("laterThan", *laterThan)
	} else {
		params.Add("departure", journey.DepartureDate.String())
	}
	if journey.ViaStationID != nil {
		params.Add("via", *journey.ViaStationID)
	}
	return a.baseURL + "/journeys?" + params.Encode()
}

func (a *DbVendoWebAPI) convertJourney(source response.Journey) (entity.Train, error) {
	legs := []entity.TrainLeg{}

	for _, leg := range source.Legs {
		if leg.Line == nil {
			continue
		}

		convertedLeg, err := a.c.ConvertLeg(leg)
		if err != nil {
			return entity.Train{}, err
		}
		from := convertedLeg.DepartureDateTime.In(time.UTC)
		to := convertedLeg.ArrivalDateTime.In(time.UTC)
		convertedLeg.DurationInMinutes = int32(to.Sub(from).Minutes())
		legs = append(legs, convertedLeg)
	}

	return entity.Train{
		RefreshToken: source.RefreshToken,
		Legs:         legs,
	}, nil
}

func checkJourneys(journeys []response.Journey, request request.Train) (response.Journey, bool) {
journeyLoop:
	for _, journey := range journeys {
		requestLegIdx := 0

		for _, leg := range journey.Legs {
			if leg.Line == nil {
				continue
			}

			if !equalIgnoringWhitespaceAndCase(leg.Line.Name, request.TrainNumbers[requestLegIdx]) {
				continue journeyLoop
			}

			if requestLegIdx = requestLegIdx + 1; requestLegIdx == len(request.TrainNumbers) {
				return journey, true
			}
		}

		return journey, true
	}

	return response.Journey{}, false
}

func equalIgnoringWhitespaceAndCase(s, t string) bool {
	sWithoutWhitespace := strings.ReplaceAll(s, " ", "")
	tWithoutWhitespace := strings.ReplaceAll(t, " ", "")
	return strings.EqualFold(sWithoutWhitespace, tWithoutWhitespace)
}
