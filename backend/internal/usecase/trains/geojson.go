package trains

import (
	"context"
	"fmt"
	"kompass/internal/entity"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

func (uc *UseCase) createGeoJson(ctx context.Context, train entity.Train) (*geojson.FeatureCollection, error) {
	legs := train.Legs

	polylines, err := uc.dbVendo.RetrievePolylines(ctx, train.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("retrieve polyline: %w", err)
	}
	if len(polylines) == 0 {
		return nil, nil
	}

	featureCollection := geojson.NewFeatureCollection()

	stationByID := map[string]entity.TrainStation{}
	legsByStation := map[string][]entity.TrainLeg{}

	for _, polyline := range polylines {
		lineString := orb.LineString{}
		for _, feature := range polyline.Features {
			lineString = append(lineString, feature.Geometry.(orb.Point))
		}
		featureCollection.Append(geojson.NewFeature(lineString))
	}

	for _, leg := range legs {
		stationByID[leg.Origin.ID] = leg.Origin
		stationByID[leg.Destination.ID] = leg.Destination
		legsByStation[leg.Origin.ID] = append(legsByStation[leg.Origin.ID], leg)
		legsByStation[leg.Destination.ID] = append(legsByStation[leg.Destination.ID], leg)
	}

	from := legs[0].Origin.Name
	to := legs[len(legs)-1].Destination.Name

	for stationID, legs := range legsByStation {
		location := stationByID[stationID].Location
		featureCollection.Append(featureWithProperties(from, to, location, legs))
	}

	return featureCollection, nil
}

func featureWithProperties(fromMunicipality string, toMunicipality string, location entity.Location, legs []entity.TrainLeg) *geojson.Feature {
	feature := geojson.NewFeature(locationToPoint(location))

	feature.Properties["type"] = "TRAIN"
	feature.Properties["fromMunicipality"] = fromMunicipality
	feature.Properties["toMunicipality"] = toMunicipality

	var legProperties []map[string]interface{}
	for _, leg := range legs {
		legProperties = append(legProperties, map[string]interface{}{
			"lineName":          leg.LineName,
			"departureDateTime": leg.DepartureDateTime,
			"arrivalDateTime":   leg.ArrivalDateTime,
			"fromStation":       leg.Origin.Name,
			"toStation":         leg.Destination.Name,
		})
	}
	feature.Properties["legs"] = legProperties

	return feature
}

func locationToPoint(location entity.Location) orb.Point {
	return orb.Point{
		float64(location.Longitude),
		float64(location.Latitude),
	}
}
