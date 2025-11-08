package entity

type Location struct {
	Latitude  float32 `json:"latitude"`
	Longitude float32 `json:"longitude"`
}

type GeocodeLocation struct {
	Label     string  `json:"label"`
	Latitude  float32 `json:"latitude"`
	Longitude float32 `json:"longitude"`
}
