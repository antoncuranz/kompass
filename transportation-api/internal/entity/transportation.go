package entity

type TransportationType string

const (
	FLIGHT TransportationType = "FLIGHT"
	TRAIN  TransportationType = "TRAIN"
	BUS    TransportationType = "BUS"
	CAR    TransportationType = "CAR"
	FERRY  TransportationType = "FERRY"
	BOAT   TransportationType = "BOAT"
	BIKE   TransportationType = "BIKE"
	HIKE   TransportationType = "HIKE"
	OTHER  TransportationType = "OTHER"
)

func (t TransportationType) String() string {
	return string(t)
}
