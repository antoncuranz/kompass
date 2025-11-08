import type { co } from "jazz-tools"
import type { Accommodation, Activity, Transportation } from "./schema"

export enum TransportationType {
  Flight = "FLIGHT",
  Train = "TRAIN",
  Bus = "BUS",
  Ferry = "FERRY",
  Boat = "BOAT",
  Bike = "BIKE",
  Car = "CAR",
  Hike = "HIKE",
  Other = "OTHER",
}

export function getTransportationTypeEmoji(type: string) {
  switch (type) {
    case TransportationType.Flight:
      return "✈️"
    case TransportationType.Train:
      return "🚇"
    case TransportationType.Bus:
      return "🚌"
    case TransportationType.Car:
      return "🚗"
    case TransportationType.Ferry:
      return "⛴️"
    case TransportationType.Boat:
      return "⛵️"
    case TransportationType.Bike:
      return "🚲"
    case TransportationType.Hike:
      return "🥾"
    case TransportationType.Other:
    default:
      return "🛸"
  }
}

export type AmbiguousFlightChoice = {
  departureDateTime: string
  destinationIata: string
  originIata: string
}

export type DayRenderData = {
  day: string
  transportation: Array<Transportation>
  activities: Array<co.loaded<typeof Activity>>
  accommodation: co.loaded<typeof Accommodation> | undefined
}

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

export type Coordinates = {
  latitude: number
  longitude: number
}
