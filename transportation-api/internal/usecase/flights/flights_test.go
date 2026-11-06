package flights

import (
	"cloud.google.com/go/civil"
	"github.com/stretchr/testify/require"
	"kompass/internal/entity"
	"testing"
)

func TestGetFlightDate(t *testing.T) {
	departure := civil.DateTime{Date: civil.Date{Year: 2026, Month: 1, Day: 31}}
	legacy := civil.Date{Year: 2026, Month: 1, Day: 30}
	leg := entity.FlightLeg{DepartureDateTime: departure, AmadeusFlightDate: &legacy}
	require.Equal(t, departure.Date, getFlightDate(leg), "legacy through-flight dates must not be sent to AeroDataBox")
}
