package converter

import (
	"kompass/internal/entity"
	"kompass/internal/repo/dbvendo/response"
	"strings"

	"cloud.google.com/go/civil"
)

// goverter:converter
// goverter:extend ParseTimestamp
type TrainConverter interface {
	ConvertJourney(source response.Journey) (entity.Train, error)
	// goverter:map PlannedDeparture DepartureDateTime
	// goverter:map PlannedArrival ArrivalDateTime
	// goverter:map Line.Name LineName
	// goverter:map Line.Operator.Name OperatorName
	// goverter:useZeroValueOnPointerInconsistency
	// TODO!
	// goverter:ignore DurationInMinutes
	ConvertLeg(source response.Leg) (entity.TrainLeg, error)

	ConvertStation(source response.StationOrStop) entity.TrainStation

	ConvertLocation(source response.Location) entity.Location
}

func ParseTimestamp(timestamp string) (civil.DateTime, error) {
	parts := strings.Split(timestamp, "+")
	return civil.ParseDateTime(parts[0])
}
