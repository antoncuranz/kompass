package response

import (
	"github.com/paulmach/orb/geojson"
)

type Location struct {
	Latitude  float32 `json:"latitude"`
	Longitude float32 `json:"longitude"`
}

type StationOrStop struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Location Location `json:"location"`
}

type Line struct {
	ID          string   `json:"id"`
	FahrtNr     string   `json:"fahrtNr"`
	Name        string   `json:"name"`
	ProductCode string   `json:"productCode"`
	Operator    Operator `json:"operator"`
}

type Operator struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Leg struct {
	TripID           string                     `json:"tripId"`
	Origin           StationOrStop              `json:"origin"`
	Destination      StationOrStop              `json:"destination"`
	PlannedDeparture string                     `json:"plannedDeparture"`
	PlannedArrival   string                     `json:"plannedArrival"`
	Line             *Line                      `json:"line" validate:"optional" extensions:"nullable"`
	Polyline         *geojson.FeatureCollection `json:"polyline,omitempty" validate:"optional" extensions:"nullable"`
}

type Journey struct {
	RefreshToken string `json:"refreshToken"`
	Legs         []Leg  `json:"legs"`
}

type JourneyResponse struct {
	Journey Journey `json:"journey"`
}

type JourneysResponse struct {
	Journeys []Journey `json:"journeys"`
	LaterRef string    `json:"laterRef"`
}
