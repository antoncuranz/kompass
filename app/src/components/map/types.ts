import type { TransportationType } from "@/domain/transportation"

export type GeoJsonFlight = {
  type: TransportationType
  fromMunicipality: string
  toMunicipality: string
  legs: string
}

export type GeoJsonFlightLeg = {
  flightNumber: string
  departureDateTime: string
  arrivalDateTime: string
  fromIata: string
  toIata: string
}

export type GeoJsonTrain = {
  type: TransportationType
  fromMunicipality: string
  toMunicipality: string
  legs: string
}

export type GeoJsonTrainLeg = {
  lineName: string
  departureDateTime: string
  arrivalDateTime: string
  fromStation: string
  toStation: string
}

export type GeoJsonTransportation = {
  type: TransportationType
  name: string
  departureDateTime: string
  arrivalDateTime: string
}
