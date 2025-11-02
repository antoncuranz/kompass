package entity

import "cloud.google.com/go/civil"

type TrainStation struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Location Location `json:"location"`
}

type TrainLeg struct {
	Origin            TrainStation   `json:"origin"`
	Destination       TrainStation   `json:"destination"`
	DepartureDateTime civil.DateTime `json:"departureDateTime"`
	ArrivalDateTime   civil.DateTime `json:"arrivalDateTime"`
	DurationInMinutes int32          `json:"durationInMinutes"`
	LineName          string         `json:"lineName"`
	OperatorName      string         `json:"operatorName"`
}

type Train struct {
	RefreshToken string     `json:"refreshToken"`
	Legs         []TrainLeg `json:"legs"`
}
