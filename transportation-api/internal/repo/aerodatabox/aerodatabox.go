package aerodatabox

import (
	"context"
	"encoding/json"
	"fmt"
	"kompass/config"
	"kompass/internal/entity"
	"kompass/internal/repo"
	"net/http"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"

	"cloud.google.com/go/civil"
	"github.com/gofiber/fiber/v2"
)

var flightNumberPattern = regexp.MustCompile(`^([A-Z0-9]{2}|[A-Z]{3})([0-9]{1,4}[A-Z]?)$`)

type WebAPI struct {
	baseURL    string
	apiKey     string
	iataLookup repo.IataLookup
	client     *http.Client
}

func New(cfg config.WebApi, lookup repo.IataLookup) *WebAPI {
	return &WebAPI{
		baseURL:    strings.TrimRight(cfg.AeroDataBoxBaseURL, "/"),
		apiKey:     cfg.AeroDataBoxApiKey,
		iataLookup: lookup,
		client:     &http.Client{Timeout: 15 * time.Second},
	}
}

type timestamp struct {
	UTC   string `json:"utc"`
	Local string `json:"local"`
}

type movement struct {
	Airport struct {
		Iata string `json:"iata"`
	} `json:"airport"`
	ScheduledTime *timestamp `json:"scheduledTime"`
}

type flight struct {
	Number    string   `json:"number"`
	Departure movement `json:"departure"`
	Arrival   movement `json:"arrival"`
	Airline   struct {
		Name string `json:"name"`
		Iata string `json:"iata"`
	} `json:"airline"`
	Aircraft *struct {
		Model string `json:"model"`
	} `json:"aircraft"`
}

func (a *WebAPI) RetrieveFlightLeg(ctx context.Context, date civil.Date, number string, origin *string) (entity.FlightLeg, error) {
	requestedNumber := number
	number = strings.ToUpper(strings.Join(strings.Fields(number), ""))
	if !date.IsValid() || !flightNumberPattern.MatchString(number) {
		return entity.FlightLeg{}, fiber.NewError(http.StatusBadRequest, "invalid flight number or departure date")
	}
	flights, err := a.requestFlights(ctx, date, number)
	if err != nil {
		return entity.FlightLeg{}, err
	}
	if origin == nil {
		flights, err = a.expandThroughFlights(ctx, date, number, flights)
		if err != nil {
			return entity.FlightLeg{}, err
		}
	}
	legs := []entity.FlightLeg{}
	seen := map[string]bool{}
	for _, f := range flights {
		if origin != nil && !strings.EqualFold(f.Departure.Airport.Iata, strings.TrimSpace(*origin)) {
			continue
		}
		// Status-only and position-only records cannot form an itinerary leg.
		if f.Departure.Airport.Iata == "" || f.Arrival.Airport.Iata == "" || f.Departure.ScheduledTime == nil || f.Arrival.ScheduledTime == nil {
			continue
		}
		leg, err := a.mapFlight(f, number)
		if err != nil {
			return entity.FlightLeg{}, fmt.Errorf("map flight: %w", err)
		}
		if origin != nil && leg.DepartureDateTime.Date != date {
			continue
		}
		key := leg.Origin.Iata + "/" + leg.Destination.Iata + "/" + leg.DepartureDateTime.String()
		if !seen[key] {
			legs = append(legs, leg)
			seen[key] = true
		}
	}
	if len(legs) == 0 {
		return entity.FlightLeg{}, fiber.NewError(http.StatusNotFound, "no matching flight found")
	}
	sort.Slice(legs, func(i, j int) bool { return legs[i].DepartureDateTime.Compare(legs[j].DepartureDateTime) < 0 })
	if len(legs) > 1 {
		choices := make([]entity.AmbiguousFlightChoice, 0, len(legs))
		for _, leg := range legs {
			choices = append(choices, entity.AmbiguousFlightChoice{OriginIata: leg.Origin.Iata, DestinationIata: leg.Destination.Iata, DepartureDateTime: leg.DepartureDateTime})
		}
		return entity.FlightLeg{}, entity.ErrAmbiguousFlightRequest{requestedNumber: choices}
	}
	return legs[0], nil
}

func (a *WebAPI) requestFlights(ctx context.Context, date civil.Date, number string) ([]flight, error) {
	endpoint := a.baseURL + "/flights/number/" + url.PathEscape(number) + "/" + date.String() + "?dateLocalRole=Departure"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("create AeroDataBox request: %w", err)
	}
	req.Header.Set("X-RapidAPI-Key", a.apiKey)
	req.Header.Set("X-RapidAPI-Host", "aerodatabox.p.rapidapi.com")
	req.Header.Set("Accept", "application/json")
	res, err := a.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request AeroDataBox flights: %w", err)
	}
	defer res.Body.Close()
	switch res.StatusCode {
	case http.StatusNoContent, http.StatusNotFound:
		return nil, nil
	case http.StatusOK:
	default:
		return nil, fiber.NewError(http.StatusBadGateway, fmt.Sprintf("AeroDataBox returned HTTP %d", res.StatusCode))
	}
	var flights []flight
	if err := json.NewDecoder(res.Body).Decode(&flights); err != nil {
		return nil, fmt.Errorf("decode AeroDataBox flights: %w", err)
	}
	return flights, nil
}

func (a *WebAPI) mapFlight(f flight, number string) (entity.FlightLeg, error) {
	origin, err := a.iataLookup.LookupAirport(f.Departure.Airport.Iata)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("lookup origin airport: %w", err)
	}
	destination, err := a.iataLookup.LookupAirport(f.Arrival.Airport.Iata)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("lookup destination airport: %w", err)
	}
	departure, departureUTC, err := parseTimestamp(*f.Departure.ScheduledTime)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("departure: %w", err)
	}
	arrival, arrivalUTC, err := parseTimestamp(*f.Arrival.ScheduledTime)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("arrival: %w", err)
	}
	duration := arrivalUTC.Sub(departureUTC)
	if duration < 0 {
		return entity.FlightLeg{}, fmt.Errorf("arrival precedes departure")
	}
	airline := f.Airline.Name
	if airline == "" {
		airline, err = a.iataLookup.LookupAirlineName(f.Airline.Iata)
		if err != nil {
			return entity.FlightLeg{}, fmt.Errorf("lookup airline: %w", err)
		}
	}
	var aircraft *string
	if f.Aircraft != nil && f.Aircraft.Model != "" {
		aircraft = &f.Aircraft.Model
	}
	parts := flightNumberPattern.FindStringSubmatch(number)
	departureDate := departure.Date
	return entity.FlightLeg{
		Origin: origin.Airport, Destination: destination.Airport, Airline: airline,
		FlightNumber:      parts[1] + " " + parts[2],
		DepartureDateTime: departure,
		ArrivalDateTime:   arrival,
		AmadeusFlightDate: &departureDate,
		DurationInMinutes: int32(duration.Minutes()), Aircraft: aircraft,
	}, nil
}

func parseTimestamp(value timestamp) (civil.DateTime, time.Time, error) {
	utc, err := parseProviderTime(value.UTC)
	if err != nil {
		return civil.DateTime{}, time.Time{}, fmt.Errorf("parse UTC time: %w", err)
	}
	local, err := parseProviderTime(value.Local)
	if err != nil {
		return civil.DateTime{}, time.Time{}, fmt.Errorf("parse local time: %w", err)
	}
	if !local.Equal(utc) {
		return civil.DateTime{}, time.Time{}, fmt.Errorf("local and UTC times disagree")
	}
	return civil.DateTimeOf(local), utc, nil
}

// RapidAPI returns a space separator and minute precision. Accept RFC3339 too
// for responses with ISO timestamps; retain offsets when producing local times.
func parseProviderTime(value string) (time.Time, error) {
	var err error
	for _, layout := range []string{time.RFC3339, "2006-01-02 15:04Z07:00", "2006-01-02 15:04:05Z07:00"} {
		var parsed time.Time
		parsed, err = time.Parse(layout, value)
		if err == nil {
			return parsed, nil
		}
	}
	return time.Time{}, err
}

// A dated AeroDataBox response can mix legs from different daily rotations.
// Start with route roots, then follow matching airports in chronological order.
// Explicit-origin lookups keep using the selected leg's own departure date.
func (a *WebAPI) expandThroughFlights(ctx context.Context, date civil.Date, number string, flights []flight) ([]flight, error) {
	usable := make([]flight, 0, len(flights))
	for _, f := range flights {
		if f.Departure.ScheduledTime == nil || f.Arrival.ScheduledTime == nil || f.Departure.Airport.Iata == "" || f.Arrival.Airport.Iata == "" {
			continue
		}
		departure, _, err := parseTimestamp(*f.Departure.ScheduledTime)
		if err != nil {
			return nil, err
		}
		if departure.Date == date {
			usable = append(usable, f)
		}
	}
	roots := []flight{}
	for _, candidate := range usable {
		hasPrevious := false
		for _, other := range usable {
			if other.Arrival.Airport.Iata == candidate.Departure.Airport.Iata {
				hasPrevious = true
				break
			}
		}
		if !hasPrevious {
			roots = append(roots, candidate)
		}
	}
	// Without a route root (e.g. circular routes), keep the dated choices.
	if len(roots) == 0 || len(roots) == len(usable) {
		return usable, nil
	}
	cache := map[civil.Date][]flight{date: usable}
	result := []flight{}
	for _, root := range roots {
		current := root
		visited := map[string]bool{root.Departure.Airport.Iata: true}
		for hops := 0; hops < 8; hops++ {
			result = append(result, current)
			airport := current.Arrival.Airport.Iata
			if visited[airport] {
				break
			}
			visited[airport] = true
			// Only expand routes evidenced by another leg in the dated response.
			hasContinuation := false
			for _, f := range usable {
				if f.Departure.Airport.Iata == airport {
					hasContinuation = true
					break
				}
			}
			if !hasContinuation {
				break
			}
			arrival, arrivalUTC, err := parseTimestamp(*current.Arrival.ScheduledTime)
			if err != nil {
				return nil, err
			}
			var next *flight
			var nextUTC time.Time
			// A short overnight stop can put the onward departure on the next day.
			for _, searchDate := range []civil.Date{arrival.Date, arrival.Date.AddDays(1)} {
				candidates, found := cache[searchDate]
				if !found {
					candidates, err = a.requestFlights(ctx, searchDate, number)
					if err != nil {
						return nil, fmt.Errorf("request onward flight: %w", err)
					}
					cache[searchDate] = candidates
				}
				for _, candidate := range candidates {
					if candidate.Departure.Airport.Iata != airport || visited[candidate.Arrival.Airport.Iata] || candidate.Departure.ScheduledTime == nil || candidate.Arrival.ScheduledTime == nil {
						continue
					}
					departure, departureUTC, err := parseTimestamp(*candidate.Departure.ScheduledTime)
					if err != nil {
						return nil, err
					}
					if departure.Date != searchDate || departureUTC.Before(arrivalUTC) || departureUTC.Sub(arrivalUTC) > 24*time.Hour {
						continue
					}
					if next == nil || departureUTC.Before(nextUTC) {
						copy := candidate
						next = &copy
						nextUTC = departureUTC
					}
				}
				if next != nil {
					break
				}
			}
			if next == nil {
				break
			}
			current = *next
		}
	}
	return result, nil
}
