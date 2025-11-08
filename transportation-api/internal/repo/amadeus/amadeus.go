package amadeus

import (
	"context"
	"errors"
	"fmt"
	"kompass/config"
	"kompass/internal/entity"
	"kompass/internal/repo"
	"time"

	"cloud.google.com/go/civil"
	"github.com/gofiber/fiber/v2"
	goiso8601duration "github.com/xnacly/go-iso8601-duration"
)

type AmadeusWebAPI struct {
	baseURL    string
	apiKey     string
	apiSecret  string
	iataLookup repo.IataLookup
}

func New(config config.WebApi, iataLookup repo.IataLookup) *AmadeusWebAPI {
	return &AmadeusWebAPI{
		baseURL:    config.AmadeusBaseURL,
		apiKey:     config.AmadeusApiKey,
		apiSecret:  config.AmadeusApiSecret,
		iataLookup: iataLookup,
	}
}

func (a *AmadeusWebAPI) RetrieveFlightLeg(ctx context.Context, date civil.Date, flightNumber string, requestedOrigin *string) (entity.FlightLeg, error) {
	flightStatusResponse, err := a.requestFlights(ctx, date, flightNumber)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("request flights: %w", err)
	}

	joinedFlightLegs := joinFlightLegs(flightStatusResponse.Data)
	if len(joinedFlightLegs) > 1 && requestedOrigin == nil {
		choices, err := a.convertChoices(joinedFlightLegs)
		if err != nil {
			return entity.FlightLeg{}, fmt.Errorf("convert choices: %w", err)
		}

		return entity.FlightLeg{}, entity.ErrAmbiguousFlightRequest{flightNumber: choices}
	}

	for _, flightLeg := range joinedFlightLegs {
		if requestedOrigin == nil || flightLeg.BoardPointIataCode == *requestedOrigin {
			return a.mapDatedFlight(flightLeg)
		}
	}

	return entity.FlightLeg{}, fiber.NewError(fiber.StatusNotFound, "no matching flight found")
}

type legOfDatedFlight struct {
	Leg
	DatedFlight
}

func (a *AmadeusWebAPI) mapDatedFlight(flightLeg legOfDatedFlight) (entity.FlightLeg, error) {
	originAirport, destinationAirport, err := a.lookupAirports(flightLeg.Leg)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("lookup airports: %w", err)
	}

	duration, err := goiso8601duration.From(flightLeg.Leg.ScheduledLegDuration)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("parse duration: %w", err)
	}

	departureDateTime, arrivalDateTime, err := determineTimestamps(flightLeg, originAirport, destinationAirport, duration)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("determine timestamps: %w", err)
	}

	aircraftName, err := a.iataLookup.LookupAircraftName(flightLeg.Leg.AircraftEquipment.AircraftType)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("lookup aircraft: %w", err)
	}

	airlineName, err := a.iataLookup.LookupAirlineName(flightLeg.DatedFlight.FlightDesignator.CarrierCode)
	if err != nil {
		return entity.FlightLeg{}, fmt.Errorf("lookup airline: %w", err)
	}

	flightNumber := fmt.Sprintf("%s %d",
		flightLeg.DatedFlight.FlightDesignator.CarrierCode,
		flightLeg.DatedFlight.FlightDesignator.FlightNumber,
	)

	return entity.FlightLeg{
		Origin:            originAirport.Airport,
		Destination:       destinationAirport.Airport,
		Airline:           airlineName,
		FlightNumber:      flightNumber,
		DepartureDateTime: departureDateTime,
		ArrivalDateTime:   arrivalDateTime,
		AmadeusFlightDate: &flightLeg.ScheduledDepartureDate,
		DurationInMinutes: int32(duration.Duration().Minutes()),
		Aircraft:          &aircraftName,
	}, nil
}

func (a *AmadeusWebAPI) lookupAirports(leg Leg) (entity.AirportWithTimezone, entity.AirportWithTimezone, error) {
	originAirport, err := a.iataLookup.LookupAirport(leg.BoardPointIataCode)
	if err != nil {
		return entity.AirportWithTimezone{}, entity.AirportWithTimezone{}, fmt.Errorf("lookup origin airport: %w", err)
	}

	destinationAirport, err := a.iataLookup.LookupAirport(leg.OffPointIataCode)
	if err != nil {
		return entity.AirportWithTimezone{}, entity.AirportWithTimezone{}, fmt.Errorf("lookup destination airport: %w", err)
	}

	return originAirport, destinationAirport, nil
}

func determineTimestamps(
	flightLeg legOfDatedFlight, originAirport entity.AirportWithTimezone, destinationAirport entity.AirportWithTimezone, duration goiso8601duration.Duration,
) (civil.DateTime, civil.DateTime, error) {

	origin, originFound := findFlightPointByIata(flightLeg.DatedFlight, flightLeg.Leg.BoardPointIataCode)
	destination, destinationFound := findFlightPointByIata(flightLeg.DatedFlight, flightLeg.Leg.OffPointIataCode)
	if !originFound && !destinationFound {
		return civil.DateTime{}, civil.DateTime{}, fmt.Errorf("no flight point found")
	}

	var departureDateTime civil.DateTime
	if originFound {
		parsed, err := findAndParseTimestamp(origin.Departure.Timings, "STD")
		if err != nil {
			return civil.DateTime{}, civil.DateTime{}, fmt.Errorf("parse timestamp: %w", err)
		}
		departureDateTime = parsed
	}

	var arrivalDateTime civil.DateTime
	if destinationFound {
		parsed, err := findAndParseTimestamp(destination.Arrival.Timings, "STA")
		if err != nil {
			return civil.DateTime{}, civil.DateTime{}, fmt.Errorf("parse timestamp: %w", err)
		}
		arrivalDateTime = parsed
	}

	if !originFound {
		offset, err := offsetTimestamp(arrivalDateTime, destinationAirport.Timezone, -duration.Duration(), originAirport.Timezone)
		if err != nil {
			return civil.DateTime{}, civil.DateTime{}, fmt.Errorf("calculate timestamp: %w", err)
		}

		departureDateTime = offset
	}

	if !destinationFound {
		offset, err := offsetTimestamp(departureDateTime, originAirport.Timezone, duration.Duration(), destinationAirport.Timezone)
		if err != nil {
			return civil.DateTime{}, civil.DateTime{}, fmt.Errorf("calculate timestamp: %w", err)
		}

		arrivalDateTime = offset
	}

	return departureDateTime, arrivalDateTime, nil
}

func offsetTimestamp(sourceTime civil.DateTime, sourceTimezone string, offset time.Duration, targetTimezone string) (civil.DateTime, error) {
	sourceLocation, err1 := time.LoadLocation(sourceTimezone)
	targetLocation, err2 := time.LoadLocation(targetTimezone)
	if err := errors.Join(err1, err2); err != nil {
		return civil.DateTime{}, fmt.Errorf("load locations: %w", err)
	}

	return civil.DateTimeOf(sourceTime.In(sourceLocation).Add(offset).In(targetLocation)), nil
}

func findFlightPointByIata(flightContract DatedFlight, iata string) (FlightPoint, bool) {
	for _, point := range flightContract.FlightPoints {
		if point.IataCode == iata {
			return point, true
		}
	}
	return FlightPoint{}, false
}

func findAndParseTimestamp(timings []Timing, preferredQualifier string) (civil.DateTime, error) {
	if len(timings) == 0 {
		return civil.DateTime{}, fmt.Errorf("timings empty")
	}

	for _, x := range timings {
		if x.Qualifier == preferredQualifier {
			return parseLocalDateTime(x.Value)
		}
	}

	return parseLocalDateTime(timings[0].Value)
}

func parseLocalDateTime(timestamp string) (civil.DateTime, error) {
	// Remove timezone and add missing seconds
	return civil.ParseDateTime(timestamp[0:16] + ":00")
}

func joinFlightLegs(flights []DatedFlight) []legOfDatedFlight {
	var joinedFlights []legOfDatedFlight
	for _, df := range flights {
		for _, leg := range df.Legs {
			joinedFlights = append(joinedFlights, legOfDatedFlight{
				DatedFlight: df,
				Leg:         leg,
			})
		}
	}
	return joinedFlights
}

func (a *AmadeusWebAPI) convertChoices(flightLegs []legOfDatedFlight) ([]entity.AmbiguousFlightChoice, error) {
	var choices []entity.AmbiguousFlightChoice
	for _, flightLeg := range flightLegs {
		originAirport, destinationAirport, err := a.lookupAirports(flightLeg.Leg)
		if err != nil {
			return nil, fmt.Errorf("lookup airports: %w", err)
		}

		duration, err := goiso8601duration.From(flightLeg.Leg.ScheduledLegDuration)
		if err != nil {
			return nil, fmt.Errorf("parse duration: %w", err)
		}

		departureDateTime, _, err := determineTimestamps(flightLeg, originAirport, destinationAirport, duration)
		if err != nil {
			return nil, fmt.Errorf("determine timestamps: %w", err)
		}

		choices = append(choices, entity.AmbiguousFlightChoice{
			OriginIata:        flightLeg.BoardPointIataCode,
			DestinationIata:   flightLeg.OffPointIataCode,
			DepartureDateTime: departureDateTime,
		})
	}
	return choices, nil
}
