package amadeus

import "cloud.google.com/go/civil"

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	Expiry      int    `json:"expires_in"`
}

type FlightStatusResponse struct {
	Data []DatedFlight `json:"data"`
}

type DatedFlight struct {
	ScheduledDepartureDate civil.Date       `json:"scheduledDepartureDate"`
	FlightDesignator       FlightDesignator `json:"flightDesignator"`
	FlightPoints           []FlightPoint    `json:"flightPoints"`
	Legs                   []Leg            `json:"legs"`
}

type FlightDesignator struct {
	CarrierCode  string `json:"carrierCode"`
	FlightNumber int32  `json:"flightNumber"`
}

type FlightPoint struct {
	IataCode  string             `json:"iataCode"`
	Departure DepartureOrArrival `json:"departure"`
	Arrival   DepartureOrArrival `json:"arrival"`
}

type DepartureOrArrival struct {
	Timings []Timing `json:"timings"`
}

type Timing struct {
	Qualifier string `json:"qualifier"`
	Value     string `json:"value"`
}

type Leg struct {
	BoardPointIataCode   string            `json:"boardPointIataCode"`
	OffPointIataCode     string            `json:"offPointIataCode"`
	AircraftEquipment    AircraftEquipment `json:"aircraftEquipment"`
	ScheduledLegDuration string            `json:"scheduledLegDuration"`
}

type AircraftEquipment struct {
	AircraftType string `json:"aircraftType"`
}

type AirportResponse struct {
	Data []Location `json:"data"`
}

type Location struct {
	Name     string  `json:"name"`
	IataCode string  `json:"iataCode"`
	GeoCode  GeoCode `json:"geoCode"`
	Address  Address `json:"address"`
}

type GeoCode struct {
	Latitude  float32 `json:"latitude"`
	Longitude float32 `json:"longitude"`
}

type Address struct {
	CityName string `json:"cityName"`
}
