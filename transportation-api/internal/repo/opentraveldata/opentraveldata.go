package opentraveldata

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"kompass/config"
	"kompass/internal/entity"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const airportDataset = "optd_por_public.csv"
const aircraftDataset = "optd_aircraft.csv"
const airlineDataset = "optd_airline_best_known_so_far.csv"

type OpenTravelData struct {
	baseURL string
	dataDir string
}

func New(config config.WebApi) *OpenTravelData {
	dataDir, _ := os.MkdirTemp("", "optd-")
	return &OpenTravelData{
		baseURL: config.OpenTravelDataBaseURL,
		dataDir: dataDir,
	}
}

func (a *OpenTravelData) LookupAirport(iata string) (entity.AirportWithTimezone, error) {
	dataset, err := a.accessDataset(airportDataset)
	if err != nil {
		return entity.AirportWithTimezone{}, fmt.Errorf("access dataset %s: %w", aircraftDataset, err)
	}
	defer dataset.Close()

	reader := createCsvReader(dataset)
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return entity.AirportWithTimezone{}, err
		}
		if len(record) < 38 || record[0] != iata {
			continue
		}

		return convertAirport(record)
	}

	return entity.AirportWithTimezone{}, fmt.Errorf("airport [iata=%s] not found in dataset", iata)
}

func convertAirport(record []string) (entity.AirportWithTimezone, error) {
	iata := record[0]
	name := record[6]
	timezone := record[31]
	city := strings.Split(record[37], "|")[0]
	latitude, err1 := strconv.ParseFloat(record[8], 32)
	longitude, err2 := strconv.ParseFloat(record[9], 32)

	if err := errors.Join(err1, err2); err != nil {
		return entity.AirportWithTimezone{}, fmt.Errorf("parse airport coordinates: %w", err)
	}

	return entity.AirportWithTimezone{
		Airport: entity.Airport{
			Iata:         iata,
			Name:         name,
			Municipality: city,
			Location: entity.Location{
				Latitude:  float32(latitude),
				Longitude: float32(longitude),
			},
		},
		Timezone: timezone,
	}, nil
}

func (a *OpenTravelData) LookupAircraftName(iata string) (string, error) {
	dataset, err := a.accessDataset(aircraftDataset)
	if err != nil {
		return "", fmt.Errorf("access dataset %s: %w", aircraftDataset, err)
	}
	defer dataset.Close()

	reader := createCsvReader(dataset)
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}
		if len(record) < 3 || record[0] != iata {
			continue
		}

		return convertAircraft(record), nil
	}

	return "", fmt.Errorf("aicraft [iata=%s] not found in dataset", iata)
}

func convertAircraft(record []string) string {
	manufacturer := record[1]
	model := record[2]
	return fmt.Sprintf("%s %s", manufacturer, model)
}

func (a *OpenTravelData) LookupAirlineName(iata string) (string, error) {
	dataset, err := a.accessDataset(airlineDataset)
	if err != nil {
		return "", fmt.Errorf("access dataset %s: %w", airlineDataset, err)
	}
	defer dataset.Close()

	reader := createCsvReader(dataset)
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}
		if len(record) < 12 || record[5] != iata || record[11] == "C" {
			continue
		}

		return record[7], nil
	}

	return "", fmt.Errorf("airline [iata=%s] not found in dataset", iata)
}

func (a *OpenTravelData) DownloadDatasets() error {
	for _, dataset := range []string{airportDataset, aircraftDataset} {
		err := a.downloadDataset(dataset)
		if err != nil {
			return err
		}
	}

	return nil
}

func (a *OpenTravelData) accessDataset(dataset string) (*os.File, error) {
	filePath := filepath.Join(a.dataDir, dataset)
	if _, err := os.Stat(filePath); errors.Is(err, os.ErrNotExist) {
		err := a.downloadDataset(dataset)
		if err != nil {
			return nil, fmt.Errorf("download dataset %s: %w", dataset, err)
		}
	}
	return os.Open(filePath)
}

func (a *OpenTravelData) downloadDataset(dataset string) error {
	datasetUrl, err := url.JoinPath(a.baseURL, dataset)
	if err != nil {
		return fmt.Errorf("join path: %w", err)
	}

	resp, err := http.Get(datasetUrl)
	if err != nil {
		return fmt.Errorf("download %s: %w", dataset, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	filePath := filepath.Join(a.dataDir, dataset)
	localFile, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("create file: %w", err)
	}
	defer localFile.Close()

	_, err = io.Copy(localFile, resp.Body)
	if err != nil {
		return fmt.Errorf("save file: %w", err)
	}

	return nil
}

func createCsvReader(file *os.File) *csv.Reader {
	reader := csv.NewReader(file)
	reader.Comma = '^'
	reader.ReuseRecord = true
	reader.FieldsPerRecord = -1
	reader.LazyQuotes = true

	return reader
}
