package request

import "kompass/internal/entity"

type Directions struct {
	Start              entity.Location           `json:"start"`
	End                entity.Location           `json:"end"`
	TransportationType entity.TransportationType `json:"transportationType"`
}
