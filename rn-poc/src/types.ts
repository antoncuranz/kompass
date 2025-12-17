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

export function getTransportationTypeEmoji(type: string): string {
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

export type DayRenderData = {
  day: string
  transportation: Array<Transportation>
  activities: Array<co.loaded<typeof Activity>>
  accommodation: co.loaded<typeof Accommodation> | undefined
}
