package integration_test

import (
	"fmt"
	"kompass/integration-test/client/api"
	"kompass/integration-test/util"
	"testing"

	"github.com/stretchr/testify/suite"
	"github.com/wiremock/go-wiremock"
)

type IntegrationTestSuite struct {
	suite.Suite
	server     string
	api        *api.Client
	wiremock   *wiremock.Client
}

func (suite *IntegrationTestSuite) SetupSuite() {
	port := "8081"
	wiremockClient, wiremockUrl := util.StartWiremockContainer(suite.T())
	util.StartBackendSubprocess(suite.T(), wiremockUrl, port)
	suite.wiremock = wiremockClient

	suite.server = fmt.Sprintf("http://127.0.0.1:%s/api/v1", port)
	api, err := api.NewClient(suite.server)
	suite.Require().NoError(err)
	suite.api = api
}

func (suite *IntegrationTestSuite) SetupTest() {
	err := suite.wiremock.Reset()
	suite.NoError(err)
}

func TestIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}
