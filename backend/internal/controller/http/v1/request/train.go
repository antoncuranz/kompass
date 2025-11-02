package request

import "cloud.google.com/go/civil"

type Train struct {
	FromStationID string     `json:"fromStationId" example:"8011113"`
	ToStationID   string     `json:"toStationId"   example:"8000261"`
	TrainNumbers  []string   `json:"trainNumbers"  example:"ICE707"`
	DepartureDate civil.Date `json:"departureDate" example:"2025-09-20"`
	ViaStationID  *string    `json:"viaStationId"  example:"8596008" extensions:"nullable"`
}
