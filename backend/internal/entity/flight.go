package entity

import (
	"fmt"

	"cloud.google.com/go/civil"
)

type Flight struct {
	Legs []FlightLeg `json:"legs"`
}

type Airport struct {
	Iata         string   `json:"iata"`
	Name         string   `json:"name"`
	Municipality string   `json:"municipality"`
	Location     Location `json:"location"`
}

type AirportWithTimezone struct {
	Airport
	Timezone string `json:"timezone"`
}

type FlightLeg struct {
	Origin            Airport        `json:"origin"`
	Destination       Airport        `json:"destination"`
	Airline           string         `json:"airline"`
	FlightNumber      string         `json:"flightNumber"`
	DepartureDateTime civil.DateTime `json:"departureDateTime"`
	ArrivalDateTime   civil.DateTime `json:"arrivalDateTime"`
	AmadeusFlightDate *civil.Date    `json:"amadeusFlightDate" extensions:"nullable"`
	DurationInMinutes int32          `json:"durationInMinutes"`
	Aircraft          *string        `json:"aircraft" extensions:"nullable"`
}

type PNR struct {
	Airline string `json:"airline" example:"LH"`
	PNR     string `json:"pnr"     example:"123456"`
}

type ErrAmbiguousFlightRequest map[string][]AmbiguousFlightChoice

type AmbiguousFlightChoice struct {
	OriginIata        string         `json:"originIata"`
	DestinationIata   string         `json:"destinationIata"`
	DepartureDateTime civil.DateTime `json:"departureDateTime"`
}

func (e ErrAmbiguousFlightRequest) Error() string {
	return fmt.Sprint(e)
}
