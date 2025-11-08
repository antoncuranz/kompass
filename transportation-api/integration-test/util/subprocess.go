package util

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type TransportationAPIProcess struct {
	cmd    *exec.Cmd
	cancel context.CancelFunc
}

func StartTransportationAPISubprocess(t testing.TB, wiremockURL string, port string) *exec.Cmd {
	t.Helper()

	buildCmd := exec.Command("go", "build", "-o", "/tmp/kompass-transportation-api", "../cmd/app")
	err := buildCmd.Run()
	require.NoErrorf(t, err, "Failed to build transportation-api binary")

	cmd := exec.CommandContext(t.Context(), "/tmp/kompass-transportation-api")
	cmd.Dir = "../" // Set working directory to transportation-api root so migrations can be found
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("HTTP_PORT=%s", port),
		fmt.Sprintf("AMADEUS_URL=%s/amadeus", wiremockURL),
		fmt.Sprintf("DBVENDO_URL=%s/dbvendo", wiremockURL),
		fmt.Sprintf("ORS_URL=%s/ors", wiremockURL),
	)

	cmd.Stdout = NewSubprocessLogger("kompass", ansiGreen, false)
	cmd.Stderr = NewSubprocessLogger("kompass", ansiGreen, true)

	err = cmd.Start()
	require.NoErrorf(t, err, "Failed to start transportation-api subprocess")

	transportationAPIURL := fmt.Sprintf("http://localhost:%s", port)
	waitForTransportationAPIReady(t, transportationAPIURL)

	t.Cleanup(func() {
		err := cmd.Process.Kill()
		assert.NoError(t, err)
		cmd.Wait()
	})

	return cmd
}

func waitForTransportationAPIReady(t testing.TB, transportationAPIURL string) {
	t.Helper()

	timeout := time.After(30 * time.Second)
	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-timeout:
			t.Fatal("Transportation API failed to start within timeout")
		case <-ticker.C:
			cmd := exec.Command("curl", "-f", "-s", fmt.Sprintf("%s/healthz", transportationAPIURL))
			if err := cmd.Run(); err == nil {
				return
			}
		}
	}
}
