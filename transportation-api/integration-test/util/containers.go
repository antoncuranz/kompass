package util

import (
	"context"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"github.com/wiremock/go-wiremock"
	wiremockTc "github.com/wiremock/wiremock-testcontainers-go"
)

func StartWiremockContainer(t testing.TB) (*wiremock.Client, string) {
	t.Helper()

	tcLogger := TcLogger{t}
	containerLogger := ContainerLogger{
		containerName: "wiremock",
		colorPrefix:   ansiYellow,
	}

	wiremockContainer, err := wiremockTc.RunContainer(t.Context(),
		testcontainers.WithImage("docker.io/wiremock/wiremock:3.13.1"),
		testcontainers.WithLogger(tcLogger),
		testcontainers.WithLogConsumers(testcontainers.LogConsumer(&containerLogger)),
		testcontainers.WithEnv(map[string]string{
			"WIREMOCK_OPTIONS": "--disable-banner --verbose",
		}),
		testcontainers.WithFiles(testcontainers.ContainerFile{
			HostFilePath:      "wiremock/",
			ContainerFilePath: "/home/",
			FileMode:          0755,
		}),
	)
	assert.NoError(t, err)

	cleanupContainer(t, wiremockContainer)

	mappedPort, err := wiremockContainer.MappedPort(t.Context(), "8080")
	assert.NoError(t, err)

	wiremockURL := fmt.Sprintf("http://localhost:%s", mappedPort.Port())
	return wiremockContainer.Client, wiremockURL
}

func cleanupContainer(t testing.TB, container testcontainers.Container) {
	t.Cleanup(func() {
		assert.NoError(t, container.Terminate(context.Background()))
	})
}
