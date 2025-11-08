package integration_test

import (
	"kompass/integration-test/client/api"
)

func (suite *IntegrationTestSuite) TestLookupFlight() {
	// given

	// when (post)
	flightDetail := suite.postAndRetrieveFlight("2026-02-01", "LH717", api.NilString{Null: true})

	// then (post)
	suite.Len(flightDetail.Legs, 1)
	suite.Equal("Lufthansa", flightDetail.Legs[0].Airline)
	suite.Equal("LH 717", flightDetail.Legs[0].FlightNumber)
	suite.Equal("Boeing 747-8i", flightDetail.Legs[0].Aircraft.Value)
	suite.Equal("2026-02-01T12:35:00", flightDetail.Legs[0].DepartureDateTime)
	suite.Equal("2026-02-01T19:00:00", flightDetail.Legs[0].ArrivalDateTime)
}

func (suite *IntegrationTestSuite) TestFLightEk412() {
	// given
	date := "2026-01-30"
	flightNumber := "EK412"

	// when (no origin)
	noOrigin, err := suite.api.PostFlight(suite.T().Context(), &api.RequestFlight{
		Legs: []api.RequestFlightLeg{{
			Date:          date,
			FlightNumber:  flightNumber,
			OriginAirport: api.NilString{Null: true},
		}},
	})

	// then (no origin)
	suite.NoError(err)
	suite.IsType(&api.EntityErrAmbiguousFlightRequest{}, noOrigin)

	// when (DXB origin)
	dxbOriginDetail := suite.postAndRetrieveFlight(date, flightNumber, api.NewNilString("DXB"))

	// then (DXB origin)
	suite.Len(dxbOriginDetail.Legs, 1)
	suite.Equal("EK 412", dxbOriginDetail.Legs[0].FlightNumber)
	suite.Equal("Emirates", dxbOriginDetail.Legs[0].Airline)
	suite.Equal("Airbus A380", dxbOriginDetail.Legs[0].Aircraft.Value)
	suite.Equal("2026-01-30T10:15:00", dxbOriginDetail.Legs[0].DepartureDateTime)
	suite.Equal("2026-01-31T07:00:00", dxbOriginDetail.Legs[0].ArrivalDateTime)

	// when (SYD origin)
	sydOriginDetail := suite.postAndRetrieveFlight(date, flightNumber, api.NewNilString("SYD"))

	// then (DXB origin)
	suite.Len(sydOriginDetail.Legs, 1)
	suite.Equal("EK 412", sydOriginDetail.Legs[0].FlightNumber)
	suite.Equal("Emirates", sydOriginDetail.Legs[0].Airline)
	suite.Equal("Airbus A380", sydOriginDetail.Legs[0].Aircraft.Value)
	suite.Equal("2026-01-31T08:45:00", sydOriginDetail.Legs[0].DepartureDateTime)
	suite.Equal("2026-01-31T14:00:00", sydOriginDetail.Legs[0].ArrivalDateTime)
}

func (suite *IntegrationTestSuite) postAndRetrieveFlight(date string, flightNumber string, origin api.NilString) api.EntityFlight {
	postRes, err := suite.api.PostFlight(suite.T().Context(), &api.RequestFlight{
		Legs: []api.RequestFlightLeg{{
			Date:          date,
			FlightNumber:  flightNumber,
			OriginAirport: origin,
		}},
	})
	suite.NoError(err)
	suite.IsType(&api.EntityFlight{}, postRes)
	return *postRes.(*api.EntityFlight)
}
