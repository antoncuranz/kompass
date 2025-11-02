package repo

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func RequestAndParseJsonBody[V interface{}](ctx context.Context, method string, url string, requestBody io.Reader) (*V, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, requestBody)
	if err != nil {
		return nil, fmt.Errorf("create http request: %w", err)
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("do http request: %w", err)
	} else if res.StatusCode != 200 {
		return nil, fmt.Errorf("http status code %d", res.StatusCode)
	}

	defer res.Body.Close()
	responseBody, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("read response body: %w", err)
	}

	var unmarshalled V
	if err := json.Unmarshal(responseBody, &unmarshalled); err != nil {
		return nil, fmt.Errorf("unmarshall JSON: %w", err)
	}

	return &unmarshalled, nil
}
