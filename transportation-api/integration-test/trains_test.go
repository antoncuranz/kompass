package integration_test

import (
	"kompass/integration-test/client/api"
)

func (suite *IntegrationTestSuite) TestCrudTrainJourney() {
	// given

	// when
	res, err := suite.api.PostTrainJourney(suite.T().Context(), &api.RequestTrain{
		DepartureDate: "2025-09-20",
		FromStationId: "8011113",
		ToStationId:   "8000261",
		TrainNumbers:  []string{"ICE707"},
	})
	suite.NoError(err)

	// then
	suite.IsType(&api.EntityTrain{}, res)
	trainDetail := res.(*api.EntityTrain)
	suite.Len(trainDetail.Legs, 1)
	suite.Equal("ICE 707", trainDetail.Legs[0].LineName)
}
