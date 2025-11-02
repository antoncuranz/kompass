package flights

import (
	"kompass/internal/entity"

	"github.com/paulmach/orb"
	"github.com/paulmach/orb/geojson"
)

func (uc *UseCase) createGeoJson(flight entity.Flight) *geojson.FeatureCollection {
	legs := flight.Legs

	featureCollection := geojson.NewFeatureCollection()
	featureCollection.ExtraMembers = map[string]interface{}{"transportationType": "FLIGHT"}

	airportByIata := map[string]entity.Airport{}
	legsByAirport := map[string][]entity.FlightLeg{}

	for _, leg := range legs {
		featureCollection.Append(geojson.NewFeature(
			orb.LineString{
				locationToPoint(leg.Origin.Location),
				locationToPoint(leg.Destination.Location),
			},
		))

		airportByIata[leg.Origin.Iata] = leg.Origin
		airportByIata[leg.Destination.Iata] = leg.Destination
		legsByAirport[leg.Origin.Iata] = append(legsByAirport[leg.Origin.Iata], leg)
		legsByAirport[leg.Destination.Iata] = append(legsByAirport[leg.Destination.Iata], leg)
	}

	from := legs[0].Origin.Municipality
	to := legs[len(legs)-1].Destination.Municipality

	for iata, legs := range legsByAirport {
		location := airportByIata[iata].Location
		featureCollection.Append(featureWithProperties(from, to, location, legs))
	}

	return featureCollection
}

func featureWithProperties(fromMunicipality string, toMunicipality string, location entity.Location, legs []entity.FlightLeg) *geojson.Feature {
	feature := geojson.NewFeature(locationToPoint(location))

	feature.Properties["type"] = "FLIGHT"
	feature.Properties["fromMunicipality"] = fromMunicipality
	feature.Properties["toMunicipality"] = toMunicipality

	var legProperties []map[string]interface{}
	for _, leg := range legs {
		legProperties = append(legProperties, map[string]interface{}{
			"flightNumber":      leg.FlightNumber,
			"departureDateTime": leg.DepartureDateTime,
			"arrivalDateTime":   leg.ArrivalDateTime,
			"fromIata":          leg.Origin.Iata,
			"toIata":            leg.Destination.Iata,
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
