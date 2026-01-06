import { co, z } from "jazz-tools"
import { LocationEntity } from "@/repo/common/schema"
import { TransportationTypeValues } from "@/domain"

export const AirportEntity = co
  .map({
    iata: z.string(),
    name: z.string(),
    municipality: z.string(),
    location: LocationEntity,
  })
  .resolved({ location: LocationEntity.resolveQuery })

export const FlightLegEntity = co
  .map({
    origin: AirportEntity,
    destination: AirportEntity,
    airline: z.string(),
    flightNumber: z.string(),
    departureDateTime: z.iso.datetime(),
    arrivalDateTime: z.iso.datetime(),
    amadeusFlightDate: z.iso.date().optional(),
    durationInMinutes: z.number(),
    aircraft: z.string().optional(),
  })
  .resolved({
    origin: AirportEntity.resolveQuery,
    destination: AirportEntity.resolveQuery,
  })

export const PnrEntity = co.map({
  airline: z.string(),
  pnr: z.string(),
})

export const FlightEntity = co
  .map({
    type: z.literal("flight"),
    legs: co.list(FlightLegEntity),
    pnrs: co.list(PnrEntity).withPermissions({ onInlineCreate: "newGroup" }),
    price: z.number().optional(),
    geoJson: z.object().optional(),
  })
  .resolved({
    legs: { $each: FlightLegEntity.resolveQuery },
    pnrs: { $each: PnrEntity.resolveQuery, $onError: "catch" },
  })

export const TrainStationEntity = co
  .map({
    id: z.string(),
    name: z.string(),
    location: LocationEntity,
  })
  .resolved({ location: LocationEntity.resolveQuery })

export const TrainLegEntity = co
  .map({
    origin: TrainStationEntity,
    destination: TrainStationEntity,
    departureDateTime: z.iso.datetime(),
    arrivalDateTime: z.iso.datetime(),
    durationInMinutes: z.number(),
    lineName: z.string(),
    operatorName: z.string(),
  })
  .resolved({
    origin: TrainStationEntity.resolveQuery,
    destination: TrainStationEntity.resolveQuery,
  })

export const TrainEntity = co
  .map({
    type: z.literal("train"),
    legs: co.list(TrainLegEntity),
    refreshToken: z.string().optional(),
    price: z.number().optional(),
    geoJson: z.object().optional(),
  })
  .resolved({
    legs: { $each: TrainLegEntity.resolveQuery },
  })

export const GenericTransportationEntity = co
  .map({
    type: z.literal("generic"),
    name: z.string(),
    genericType: z.enum(TransportationTypeValues),
    departureDateTime: z.iso.datetime(),
    arrivalDateTime: z.iso.datetime(),
    origin: LocationEntity,
    destination: LocationEntity,
    originAddress: z.string().optional(),
    destinationAddress: z.string().optional(),
    price: z.number().optional(),
    geoJson: z.object().optional(),
  })
  .resolved({
    origin: LocationEntity.resolveQuery,
    destination: LocationEntity.resolveQuery,
  })

export const TransportationEntity = co.discriminatedUnion("type", [
  GenericTransportationEntity,
  FlightEntity,
  TrainEntity,
])
export type TransportationEntity =
  | co.loaded<typeof FlightEntity>
  | co.loaded<typeof TrainEntity>
  | co.loaded<typeof GenericTransportationEntity>
