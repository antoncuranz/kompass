package integration_test

import (
	"kompass/integration-test/client/api"
)

func (suite *IntegrationTestSuite) TestLookupFlight() {
	// given

	// when (post)
	flightDetail := suite.postAndRetrieveFlight("2026-11-06", "LH717", api.NilString{Null: true})

	// then (post)
	suite.Len(flightDetail.Legs, 1)
	suite.Equal("Lufthansa", flightDetail.Legs[0].Airline)
	suite.Equal("LH 717", flightDetail.Legs[0].FlightNumber)
	suite.Equal("Boeing 747", flightDetail.Legs[0].Aircraft.Value)
	suite.Equal("2026-11-06T12:35:00", flightDetail.Legs[0].DepartureDateTime)
	suite.Equal("2026-11-06T19:00:00", flightDetail.Legs[0].ArrivalDateTime)
}

func (suite *IntegrationTestSuite) TestFlightEk412() {
	// given
	date := "2026-11-06"
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
	suite.Require().IsType(&api.EntityErrAmbiguousFlightRequest{}, noOrigin)
	choices := (*noOrigin.(*api.EntityErrAmbiguousFlightRequest))[flightNumber]
	suite.Require().Len(choices, 2)
	suite.Equal("DXB", choices[0].OriginIata)
	suite.Equal("2026-11-06T10:15:00", choices[0].DepartureDateTime)
	suite.Equal("SYD", choices[1].OriginIata)
	suite.Equal("2026-11-07T09:00:00", choices[1].DepartureDateTime)

	// when (DXB origin)
	dxbOriginDetail := suite.postAndRetrieveFlight(date, flightNumber, api.NewNilString("DXB"))

	// then (DXB origin)
	suite.Len(dxbOriginDetail.Legs, 1)
	suite.Equal("EK 412", dxbOriginDetail.Legs[0].FlightNumber)
	suite.Equal("Emirates", dxbOriginDetail.Legs[0].Airline)
	suite.Equal("Airbus A380-800", dxbOriginDetail.Legs[0].Aircraft.Value)
	suite.Equal("2026-11-06T10:15:00", dxbOriginDetail.Legs[0].DepartureDateTime)
	suite.Equal("2026-11-07T07:00:00", dxbOriginDetail.Legs[0].ArrivalDateTime)

	// when (SYD origin)
	sydOriginDetail := suite.postAndRetrieveFlight("2026-11-07", flightNumber, api.NewNilString("SYD"))

	// then (DXB origin)
	suite.Len(sydOriginDetail.Legs, 1)
	suite.Equal("EK 412", sydOriginDetail.Legs[0].FlightNumber)
	suite.Equal("Emirates", sydOriginDetail.Legs[0].Airline)
	suite.Equal("Airbus A380-800", sydOriginDetail.Legs[0].Aircraft.Value)
	suite.Equal("2026-11-07T09:00:00", sydOriginDetail.Legs[0].DepartureDateTime)
	suite.Equal("2026-11-07T14:15:00", sydOriginDetail.Legs[0].ArrivalDateTime)
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
	suite.Equal(date, postRes.(*api.EntityFlight).Legs[0].DepartureDateTime[:10])
	return *postRes.(*api.EntityFlight)
}
