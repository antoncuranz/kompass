package aerodatabox

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"kompass/config"
	"kompass/internal/entity"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"cloud.google.com/go/civil"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/require"
)

type airportLookup struct{}

func (airportLookup) LookupAirport(iata string) (entity.AirportWithTimezone, error) {
	return entity.AirportWithTimezone{Airport: entity.Airport{Iata: iata}}, nil
}
func (airportLookup) LookupAirlineName(string) (string, error) { return "Lufthansa", nil }
func (airportLookup) LookupAircraftName(string) (string, error) {
	panic("aircraft lookup should not be needed")
}

func TestRetrieveFlightLeg(t *testing.T) {
	body, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_lh717.json")
	require.NoError(t, err)
	server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "/flights/number/LH717/2026-11-06", r.URL.Path)
		require.Equal(t, "Departure", r.URL.Query().Get("dateLocalRole"))
		require.Equal(t, "test-key", r.Header.Get("X-RapidAPI-Key"))
		require.Equal(t, "aerodatabox.p.rapidapi.com", r.Header.Get("X-RapidAPI-Host"))
		require.Empty(t, r.Header.Get("X-Api-Key"))
		_, _ = w.Write(body)
	}))
	defer server.Close()
	api := New(config.WebApi{AeroDataBoxBaseURL: server.URL, AeroDataBoxApiKey: "test-key"}, airportLookup{})
	api.client = server.Client()
	leg, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, " lh 717 ", nil)
	require.NoError(t, err)
	require.Equal(t, "LH 717", leg.FlightNumber)
	require.Equal(t, "2026-11-06T12:35:00", leg.DepartureDateTime.String())
	require.EqualValues(t, 865, leg.DurationInMinutes)
	require.Equal(t, "Boeing 747", *leg.Aircraft)
	require.Equal(t, leg.DepartureDateTime.Date, *leg.AmadeusFlightDate)
}

func TestFlightSelection(t *testing.T) {
	body, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_ek412.json")
	require.NoError(t, err)
	onward, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_ek412_onward.json")
	require.NoError(t, err)
	requests := []string{}
	server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requests = append(requests, r.URL.Path)
		if r.URL.Path == "/flights/number/EK412/2026-11-07" {
			_, _ = w.Write(onward)
			return
		}
		_, _ = w.Write(body)
	}))
	defer server.Close()
	api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
	api.client = server.Client()
	date := civil.Date{Year: 2026, Month: 11, Day: 6}
	_, err = api.RetrieveFlightLeg(context.Background(), date, "ek 412", nil)
	var ambiguous entity.ErrAmbiguousFlightRequest
	require.ErrorAs(t, err, &ambiguous)
	require.Len(t, ambiguous["ek 412"], 2)
	require.Equal(t, "DXB", ambiguous["ek 412"][0].OriginIata)
	require.Equal(t, "2026-11-06T10:15:00", ambiguous["ek 412"][0].DepartureDateTime.String())
	require.Equal(t, "SYD", ambiguous["ek 412"][1].OriginIata)
	require.Equal(t, "2026-11-07T09:00:00", ambiguous["ek 412"][1].DepartureDateTime.String())
	require.Equal(t, []string{"/flights/number/EK412/2026-11-06", "/flights/number/EK412/2026-11-07"}, requests)
	originOnward := "SYD"
	onwardLeg, err := api.RetrieveFlightLeg(context.Background(), date.AddDays(1), "EK412", &originOnward)
	require.NoError(t, err)
	require.Equal(t, "2026-11-07T09:00:00", onwardLeg.DepartureDateTime.String())
	require.Equal(t, date.AddDays(1), onwardLeg.DepartureDateTime.Date)

	origin := "syd"
	leg, err := api.RetrieveFlightLeg(context.Background(), date, "EK412", &origin)
	require.NoError(t, err)
	require.Equal(t, "SYD", leg.Origin.Iata)
	require.Equal(t, date, *leg.AmadeusFlightDate)
	require.Equal(t, "2026-11-06T09:00:00", leg.DepartureDateTime.String())
	require.Equal(t, "2026-11-06T14:15:00", leg.ArrivalDateTime.String())
	require.EqualValues(t, 195, leg.DurationInMinutes)
	require.Equal(t, "Airbus A380-800", *leg.Aircraft)
	origin = "FRA"
	_, err = api.RetrieveFlightLeg(context.Background(), date, "EK412", &origin)
	requireHTTPError(t, err, 404)
}

func requireHTTPError(t *testing.T, err error, status int) {
	t.Helper()
	var httpError *fiber.Error
	require.True(t, errors.As(err, &httpError), "expected HTTP error, got %v", err)
	require.Equal(t, status, httpError.Code)
}

func TestUpstreamFailures(t *testing.T) {
	for _, status := range []int{204, 404, 401, 403, 429, 500, 503} {
		t.Run(fmt.Sprint(status), func(t *testing.T) {
			server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(status) }))
			defer server.Close()
			api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
			api.client = server.Client()
			_, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, "LH717", nil)
			expected := 502
			if status == 204 || status == 404 {
				expected = 404
			}
			requireHTTPError(t, err, expected)
		})
	}
}

func TestPartialAndDuplicateFlights(t *testing.T) {
	body, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_lh717.json")
	require.NoError(t, err)
	// Include incomplete records and a duplicate alongside a usable flight.
	var records []json.RawMessage
	require.NoError(t, json.Unmarshal(body, &records))
	combined, err := json.Marshal([]json.RawMessage{json.RawMessage(`{}`), records[0], records[0]})
	require.NoError(t, err)
	server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write(combined) }))
	defer server.Close()
	api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
	api.client = server.Client()
	leg, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, "LH717", nil)
	require.NoError(t, err)
	require.Equal(t, "LH 717", leg.FlightNumber)
}

func TestInvalidInput(t *testing.T) {
	api := New(config.WebApi{}, airportLookup{})
	for _, number := range []string{"", "L", "LH", "../flights", "LH717?x=y"} {
		_, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, number, nil)
		requireHTTPError(t, err, 400)
	}
}

func TestParseTimestamp(t *testing.T) {
	local, utc, err := parseTimestamp(timestamp{UTC: "2026-03-29T01:30:00Z", Local: "2026-03-29T03:30:00+02:00"})
	require.NoError(t, err)
	require.Equal(t, "2026-03-29T03:30:00", local.String())
	require.Equal(t, time.UTC, utc.Location())
	for _, value := range []timestamp{{UTC: "bad", Local: "bad"}, {UTC: "2026-03-29T01:30:00Z", Local: "bad"}, {UTC: "2026-03-29T01:30:00Z", Local: "2026-03-29T01:30:00+02:00"}} {
		_, _, err := parseTimestamp(value)
		require.Error(t, err)
	}
}

// Exercise HTTP requests without opening sockets, so these tests also run in sandboxes.
type handlerTransport struct{ handler http.Handler }

func (h handlerTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	recorder := httptest.NewRecorder()
	h.handler.ServeHTTP(recorder, req)
	return recorder.Result(), nil
}

type testServer struct {
	URL     string
	handler http.Handler
}

func newTestServer(handler http.Handler) *testServer {
	return &testServer{URL: "https://aerodatabox.test", handler: handler}
}
func (s *testServer) Client() *http.Client {
	return &http.Client{Transport: handlerTransport{handler: s.handler}}
}
func (s *testServer) Close() {}

func TestResponseVariants(t *testing.T) {
	body, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_lh717.json")
	require.NoError(t, err)
	var records []flight
	require.NoError(t, json.Unmarshal(body, &records))
	for _, tc := range []struct {
		name string
		body string
	}{
		{name: "empty", body: `[]`},
		{name: "partial", body: `[{"departure":{"airport":{"iata":"HND"}}}]`},
		{name: "malformed", body: `{"error":"unexpected response"}`},
		{name: "wrong departure date", body: string(body)},
	} {
		t.Run(tc.name, func(t *testing.T) {
			server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write([]byte(tc.body)) }))
			api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
			api.client = server.Client()
			_, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 7}, "LH717", nil)
			require.Error(t, err)
			if tc.name != "malformed" {
				requireHTTPError(t, err, 404)
			}
		})
	}
	records[0].Aircraft = nil
	noAircraft, err := json.Marshal(records)
	require.NoError(t, err)
	server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write(noAircraft) }))
	api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
	api.client = server.Client()
	leg, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, "LH717", nil)
	require.NoError(t, err)
	require.Nil(t, leg.Aircraft)
}

func TestProviderTimeFormats(t *testing.T) {
	for _, value := range []string{"2026-11-06 03:35Z", "2026-11-06 03:35:00Z", "2026-11-06T03:35:00Z", "2026-11-06 12:35+09:00", "2026-11-06 12:35:00+09:00", "2026-11-06T12:35:00+09:00"} {
		t.Run(value, func(t *testing.T) {
			parsed, err := parseProviderTime(value)
			require.NoError(t, err)
			require.Equal(t, "2026-11-06T03:35:00Z", parsed.UTC().Format(time.RFC3339))
		})
	}
}

func TestScheduleUpdate(t *testing.T) {
	body, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_lh717_updated.json")
	require.NoError(t, err)
	server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { _, _ = w.Write(body) }))
	api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
	api.client = server.Client()
	leg, err := api.RetrieveFlightLeg(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, "LH717", nil)
	require.NoError(t, err)
	require.Equal(t, "2026-11-06T12:40:00", leg.DepartureDateTime.String())
	require.Equal(t, "2026-11-06T19:15:00", leg.ArrivalDateTime.String())
	require.EqualValues(t, 875, leg.DurationInMinutes)
	require.Equal(t, "Boeing 747-400", *leg.Aircraft)
}

func TestThroughFlightConnectionTiming(t *testing.T) {
	initialBody, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_ek412.json")
	require.NoError(t, err)
	onwardBody, err := os.ReadFile("../../../integration-test/wiremock/__files/aerodatabox_ek412_onward.json")
	require.NoError(t, err)
	var initial, onward []flight
	require.NoError(t, json.Unmarshal(initialBody, &initial))
	require.NoError(t, json.Unmarshal(onwardBody, &onward))
	for _, tc := range []struct {
		name       string
		departure  string
		searchDate string
		expected   int
	}{
		{"departure before arrival", "2026-11-07T06:00:00+11:00", "2026-11-07", 1},
		{"same morning connection", "2026-11-07T09:00:00+11:00", "2026-11-07", 2},
		{"overnight connection", "2026-11-08T00:30:00+11:00", "2026-11-08", 2},
		{"stopover exceeds one day", "2026-11-08T09:00:00+11:00", "2026-11-08", 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			candidate := onward[0]
			departure, err := time.Parse(time.RFC3339, tc.departure)
			require.NoError(t, err)
			candidate.Departure.ScheduledTime = &timestamp{Local: tc.departure, UTC: departure.UTC().Format(time.RFC3339)}
			arrival := departure.Add(195 * time.Minute)
			candidate.Arrival.ScheduledTime = &timestamp{Local: arrival.In(time.FixedZone("NZDT", 13*60*60)).Format(time.RFC3339), UTC: arrival.UTC().Format(time.RFC3339)}
			server := newTestServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path != "/flights/number/EK412/"+tc.searchDate {
					w.WriteHeader(http.StatusNoContent)
					return
				}
				require.NoError(t, json.NewEncoder(w).Encode([]flight{candidate}))
			}))
			api := New(config.WebApi{AeroDataBoxBaseURL: server.URL}, airportLookup{})
			api.client = server.Client()
			result, err := api.expandThroughFlights(context.Background(), civil.Date{Year: 2026, Month: 11, Day: 6}, "EK412", initial)
			require.NoError(t, err)
			require.Len(t, result, tc.expected)
			require.Equal(t, "DXB", result[0].Departure.Airport.Iata)
			if tc.expected == 2 {
				require.Equal(t, tc.departure, result[1].Departure.ScheduledTime.Local)
			}
		})
	}
}
