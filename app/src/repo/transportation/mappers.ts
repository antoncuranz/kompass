import type {
  AirportEntity,
  FlightEntity,
  FlightLegEntity,
  GenericTransportationEntity,
  PnrEntity,
  TrainEntity,
  TrainLegEntity,
  TrainStationEntity,
} from "@/repo/jazzSchema"
import type {
  Airport,
  Flight,
  FlightLeg,
  GenericTransportation,
  PNR,
  Train,
  TrainLeg,
  TrainStation,
} from "@/domain"
import type { co } from "jazz-tools"
import { mapLocation } from "@/repo/commonMappers"
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
  }
}
