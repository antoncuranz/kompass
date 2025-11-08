package amadeus

import (
	"cloud.google.com/go/civil"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func (a *AmadeusWebAPI) requestFlights(ctx context.Context, date civil.Date, flightNumber string) (FlightStatusResponse, error) {
	urlFormat := "%s/v2/schedule/flights?carrierCode=%s&flightNumber=%s&scheduledDepartureDate=%s"
	scheduleUrl := fmt.Sprintf(urlFormat, a.baseURL, flightNumber[:2], strings.TrimSpace(flightNumber[2:]), date.String())

	req, err := http.NewRequestWithContext(ctx, "GET", scheduleUrl, nil)
	if err != nil {
		return FlightStatusResponse{}, fmt.Errorf("create http request: %w", err)
	}

	accessToken, err := a.requestToken(ctx)
	if err != nil {
		return FlightStatusResponse{}, fmt.Errorf("get access token: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken.AccessToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return FlightStatusResponse{}, fmt.Errorf("do http request: %w", err)
	} else if res.StatusCode != 200 {
		return FlightStatusResponse{}, fmt.Errorf("http status code %d: %w", res.StatusCode, err)
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return FlightStatusResponse{}, fmt.Errorf("read response body: %w", err)
	}

	var flightStatusResponse FlightStatusResponse
	if err := json.Unmarshal(body, &flightStatusResponse); err != nil {
		return FlightStatusResponse{}, fmt.Errorf("unmarshall JSON: %w", err)
	}

	return flightStatusResponse, nil
}

func (a *AmadeusWebAPI) requestToken(ctx context.Context) (AccessTokenResponse, error) {
	endpoint := fmt.Sprintf("%s/v1/security/oauth2/token", a.baseURL)

	form := url.Values{
		"grant_type":    {"client_credentials"},
		"client_id":     {a.apiKey},
		"client_secret": {a.apiSecret},
	}

	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return AccessTokenResponse{}, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return AccessTokenResponse{}, fmt.Errorf("do http request: %w", err)
	} else if res.StatusCode != 200 {
		return AccessTokenResponse{}, fmt.Errorf("http status code %d: %w", res.StatusCode, err)
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return AccessTokenResponse{}, fmt.Errorf("read response body: %w", err)
	}

	var respData AccessTokenResponse
	if err := json.Unmarshal(body, &respData); err != nil {
		return AccessTokenResponse{}, fmt.Errorf("unmarshal JSON: %w", err)
	}

	return respData, nil
}
