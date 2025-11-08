package util

import (
	"fmt"
	"os"
	"strings"
	"testing"

	"github.com/testcontainers/testcontainers-go"
)

const (
	ansiReset  = "\033[0m"
	ansiBold   = "\033[1m"
	ansiRed    = "\033[31m"
	ansiGreen  = "\033[32m"
	ansiYellow = "\033[33m"
	ansiBlue   = "\033[34m"
	ansiCyan   = "\033[36m"
)

type ContainerLogger struct {
	testing.TB
	containerName string
	colorPrefix   string
}

func (c *ContainerLogger) Accept(log testcontainers.Log) {
	content := string(log.Content)
	isStderr := strings.ToUpper(log.LogType) == "STDERR"
	writeLogWithPrefix(content, c.containerName, c.colorPrefix, isStderr)
}

type TcLogger struct {
	testing.TB
}

func (t TcLogger) Printf(format string, v ...any) {
	t.Helper()
	line := fmt.Sprintf(format, v...)
	writeLogWithPrefix(line, "testcontainers", ansiCyan, false)
}

type SubprocessLogger struct {
	name        string
	colorPrefix string
	isStderr    bool
}

func NewSubprocessLogger(name, colorPrefix string, isStderr bool) *SubprocessLogger {
	return &SubprocessLogger{
		name:        name,
		colorPrefix: colorPrefix,
		isStderr:    isStderr,
	}
}

func (s *SubprocessLogger) Write(p []byte) (n int, err error) {
	content := string(p)
	writeLogWithPrefix(content, s.name, s.colorPrefix, s.isStderr)
	return len(p), nil
}

func writeLogWithPrefix(content, name, colorPrefix string, isStderr bool) {
	lines := strings.Split(content, "\n")

	prefix := fmt.Sprintf("%s[%s]%s", colorPrefix, name, ansiReset)
	for i, line := range lines {
		// Skip final empty slice element caused by trailing newline to avoid double blank line
		if i == len(lines)-1 && line == "" {
			continue
		}

		if isStderr {
			fmt.Fprintf(os.Stdout, "%s %s%s%s\n", prefix, ansiBold+ansiRed, line, ansiReset)
		} else {
			fmt.Fprintf(os.Stdout, "%s %s\n", prefix, line)
		}
	}
}
