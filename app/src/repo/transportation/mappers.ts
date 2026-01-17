import {
  FlightEntity,
  GenericTransportationEntity,
  TrainEntity,
} from "./schema"
import type {
  AirportEntity,
  FlightLegEntity,
  PnrEntity,
  TrainLegEntity,
  TrainStationEntity,
  TransportationEntity,
} from "./schema"
import type {
  Airport,
  Flight,
  FlightLeg,
  GenericTransportation,
  PNR,
  Train,
  TrainLeg,
  TrainStation,
  Transportation,
} from "@/domain"
import type { co } from "jazz-tools"
import type { GeoJSONFeatureCollection } from "zod-geojson"
import { mapLocation, mapPricing } from "@/repo/common/mappers"
// eslint-disable @typescript-eslint/no-misused-spread

function mapAirport(entity: co.loaded<typeof AirportEntity>): Airport {
  return {
    ...entity,
    location: mapLocation(entity.location),
  }
}

function mapFlightLeg(entity: co.loaded<typeof FlightLegEntity>): FlightLeg {
  return {
    id: entity.$jazz.id,
    ...entity,
    origin: mapAirport(entity.origin),
    destination: mapAirport(entity.destination),
  }
}

function mapPnr(entity: co.loaded<typeof PnrEntity>): PNR {
  return {
    id: entity.$jazz.id,
    ...entity,
  }
}

export function mapFlight(entity: co.loaded<typeof FlightEntity>): Flight {
  return {
    id: entity.$jazz.id,
    ...entity,
    legs: entity.legs.map(mapFlightLeg),
    pnrs: entity.pnrs.$isLoaded ? entity.pnrs.map(mapPnr) : [],
    pricing: mapPricing(entity.pricing),
    geoJson: entity.geoJson as GeoJSONFeatureCollection,
  }
}

function mapTrainStation(
  entity: co.loaded<typeof TrainStationEntity>,
): TrainStation {
  return {
    ...entity,
    location: mapLocation(entity.location),
  }
}

function mapTrainLeg(entity: co.loaded<typeof TrainLegEntity>): TrainLeg {
  return {
    id: entity.$jazz.id,
    ...entity,
    origin: mapTrainStation(entity.origin),
    destination: mapTrainStation(entity.destination),
  }
}

export function mapTrain(entity: co.loaded<typeof TrainEntity>): Train {
  return {
    id: entity.$jazz.id,
    ...entity,
    legs: entity.legs.map(mapTrainLeg),
    pricing: mapPricing(entity.pricing),
    geoJson: entity.geoJson as GeoJSONFeatureCollection | undefined,
  }
}

export function mapGenericTransportation(
  entity: co.loaded<typeof GenericTransportationEntity>,
): GenericTransportation {
  return {
    id: entity.$jazz.id,
    ...entity,
    origin: mapLocation(entity.origin),
    destination: mapLocation(entity.destination),
    pricing: mapPricing(entity.pricing),
    geoJson: entity.geoJson as GeoJSONFeatureCollection | undefined,
  }
}

export async function loadAndMapTransportation(
  transportation: co.loaded<typeof TransportationEntity>,
): Promise<Transportation> {
  switch (transportation.type) {
    case "flight":
      return mapFlight(
        await transportation.$jazz.ensureLoaded({
          resolve: FlightEntity.resolveQuery,
        }),
      )

    case "train":
      return mapTrain(
        await transportation.$jazz.ensureLoaded({
          resolve: TrainEntity.resolveQuery,
        }),
      )

    case "generic":
      return mapGenericTransportation(
        await transportation.$jazz.ensureLoaded({
          resolve: GenericTransportationEntity.resolveQuery,
        }),
      )
  }
}
