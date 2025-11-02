package config

import (
	"fmt"

	"github.com/caarlos0/env/v11"
)

type (
	Config struct {
		HTTP    HTTP
		Log     Log
		Metrics Metrics
		Swagger Swagger
		WebApi  WebApi
	}

	HTTP struct {
		Port           string `env:"HTTP_PORT" envDefault:"8080"`
		UsePreforkMode bool   `env:"HTTP_USE_PREFORK_MODE" envDefault:"false"`
	}

	Log struct {
		Level string `env:"LOG_LEVEL" envDefault:"debug"`
	}

	Metrics struct {
		Enabled bool `env:"METRICS_ENABLED" envDefault:"true"`
	}

	Swagger struct {
		Enabled bool `env:"SWAGGER_ENABLED" envDefault:"false"`
	}

	WebApi struct {
		AmadeusBaseURL          string `env:"AMADEUS_URL" envDefault:"https://api.amadeus.com"`
		AmadeusApiKey           string `env:"AMADEUS_APIKEY"`
		AmadeusApiSecret        string `env:"AMADEUS_APISECRET"`
		DbVendoBaseURL          string `env:"DBVENDO_URL"`
		OpenTravelDataBaseURL   string `env:"OPTD_URL" envDefault:"https://raw.githubusercontent.com/opentraveldata/opentraveldata/refs/heads/master/opentraveldata"`
		OpenRouteServiceBaseURL string `env:"ORS_URL" envDefault:"https://api.openrouteservice.org"`
		OpenRouteServiceApiKey  string `env:"ORS_APIKEY"`
	}
)

func NewConfig() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("config error: %w", err)
	}

	return cfg, nil
}
