# CLAUDE.md

## Project Overview

Go microservice providing transportation search (flights, trains), geocoding, and directions. Stateless design that forwards to third-party APIs with data enrichment. Uses Fiber web framework.

## Architecture

**Pattern**: Clean/Hexagonal Architecture
- `internal/controller/http`: Fiber handlers, routing, middleware
- `internal/usecase`: Business logic orchestration
- `internal/repo`: Third-party API integrations
- `internal/entity`: Domain models
- `pkg/`: Reusable infrastructure (httpserver, logger)

**Entry Point**: `cmd/app/main.go` → `internal/app/app.go` (dependency injection)

## Key Integrations

### Amadeus API (`internal/repo/amadeus`)
Flight schedule/status data. OAuth2 client credentials flow. Requires OPTD for IATA lookups (airport/airline/aircraft enrichment).

**Note**: No token caching—requests new token per flight lookup.

### DB Vendo API (`internal/repo/dbvendo`)
Train journey data. Paginates search results up to 10 times using `laterThan` tokens. Matches train numbers with whitespace/case flexibility.

**Codegen**: Uses `goverter` for DTO conversion.

### OpenTravelData (`internal/repo/opentraveldata`)
IATA reference data (airports, airlines, aircraft). Downloads CSVs to working directory on first access:
- `optd_por_public.csv` (12.7 MB)
- `optd_aircraft.csv` (19 KB)
- `optd_airline_best_known_so_far.csv` (177 KB)

**Stateful behavior**: Files persist in container filesystem after download.

### OpenRouteService (`internal/repo/openrouteservice`)
Geocoding and routing. Supports profiles: cycling-regular, foot-hiking, driving-car.

## Development Commands

```bash
make help                # Show all commands
make codegen             # Run all codegen (openapi + goverter)
make openapi             # Generate Swagger docs + test client
make goverter            # Generate DB Vendo converters
make mock                # Generate mocks (mockgen)
make test                # Unit tests
make integration-test    # Integration tests (testcontainers + WireMock)
make format              # Run gofmt
make linter-golangci     # Lint with golangci-lint
make pre-commit          # Full pipeline (openapi, mock, format, lint, test)
make build-image         # Docker build
```

## Code Generation

Tools used:
- **swag**: Parses annotations → `docs/swagger.{json,yaml}`
- **ogen**: Generates test client from OpenAPI spec
- **goverter**: Generates type converters for DB Vendo DTOs
- **mockgen**: Generates mocks from interfaces

Run `make codegen` after changing annotations or interfaces.

## Testing

**Unit**: `make test` runs all package tests

**Integration**: `make integration-test` uses testcontainers + WireMock
- WireMock mappings: `integration-test/wiremock/`
- Mocks Amadeus, DB Vendo, ORS responses
