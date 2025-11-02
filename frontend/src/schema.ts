import { co, z } from "jazz-tools"

export const Location = co.map({
  latitude: z.number(),
  longitude: z.number(),
})
export type Location = co.loaded<typeof Location>

export const Activity = co.map({
  name: z.string(),
  description: z.string().optional(),
  date: z.iso.date(),
  time: z.iso.time().optional(),
  price: z.number().optional(),
  address: z.string().optional(),
  location: Location.optional(),
})
export const RESOLVE_ACTIVITY = {
  location: true,
}
export type Activity = co.loaded<typeof Activity, typeof RESOLVE_ACTIVITY>

export const Accommodation = co.map({
  name: z.string(),
  description: z.string().optional(),
  arrivalDate: z.iso.date(),
  departureDate: z.iso.date(),
  price: z.number().optional(),
  address: z.string().optional(),
  location: Location.optional(),
})
export const RESOLVE_ACCOMMODATION = {
  location: true,
}
export type Accommodation = co.loaded<
  typeof Accommodation,
  typeof RESOLVE_ACCOMMODATION
>

export const Airport = co.map({
  iata: z.string(),
  name: z.string(),
  municipality: z.string(),
  location: Location,
})
export const RESOLVE_AIRPORT = {
  location: true,
}
export type Airport = co.loaded<typeof Airport, typeof RESOLVE_AIRPORT>

export const FlightLeg = co.map({
  origin: Airport,
  destination: Airport,
  airline: z.string(),
  flightNumber: z.string(),
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  amadeusFlightDate: z.iso.date().optional(),
  durationInMinutes: z.number(),
  aircraft: z.string().optional(),
})
export const RESOLVE_FLIGHT_LEG = {
  origin: RESOLVE_AIRPORT,
  destination: RESOLVE_AIRPORT,
}
export type FlightLeg = co.loaded<typeof FlightLeg, typeof RESOLVE_FLIGHT_LEG>

export const PNR = co.map({
  airline: z.string(),
  pnr: z.string(),
})
export type PNR = co.loaded<typeof PNR>

export const FlightDetail = co.map({
  legs: co.list(FlightLeg),
  pnrs: co.list(PNR),
})
export const RESOLVE_FLIGHT_DETAIL = {
  legs: { $each: RESOLVE_FLIGHT_LEG },
  pnrs: { $each: true },
}
export type FlightDetail = co.loaded<
  typeof FlightDetail,
  typeof RESOLVE_FLIGHT_DETAIL
>

export const TrainStation = co.map({
  id: z.string(),
  name: z.string(),
  location: Location,
})
export const RESOLVE_TRAIN_STATION = {
  location: true,
}
export type TrainStation = co.loaded<
  typeof TrainStation,
  typeof RESOLVE_TRAIN_STATION
>

export const TrainLeg = co.map({
  origin: TrainStation,
  destination: TrainStation,
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  durationInMinutes: z.number(),
  lineName: z.string(),
  operatorName: z.string(),
})
export const RESOLVE_TRAIN_LEG = {
  origin: RESOLVE_TRAIN_STATION,
  destination: RESOLVE_TRAIN_STATION,
}
export type TrainLeg = co.loaded<typeof TrainLeg, typeof RESOLVE_TRAIN_LEG>

export const GenericTransportation = co.map({
  type: z.literal("generic"),
  name: z.string(),
  genericType: z.string(),
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  origin: Location,
  destination: Location,
  originAddress: z.string().optional(),
  destinationAddress: z.string().optional(),
  price: z.number().optional(),
  geoJson: z.object().optional(),
})
export const RESOLVE_GENERIC_TRANSPORTATION = {
  origin: true,
  destination: true,
}
export type GenericTransportation = co.loaded<
  typeof GenericTransportation,
  typeof RESOLVE_GENERIC_TRANSPORTATION
>

export const Flight = co.map({
  type: z.literal("flight"),
  legs: co.list(FlightLeg),
  pnrs: co.list(PNR),
  price: z.number().optional(),
  geoJson: z.object().optional(),
})
export const RESOLVE_FLIGHT = {
  legs: { $each: RESOLVE_FLIGHT_LEG },
  pnrs: { $each: true },
}
export type Flight = co.loaded<typeof Flight, typeof RESOLVE_FLIGHT>

export const Train = co.map({
  type: z.literal("train"),
  legs: co.list(TrainLeg),
  refreshToken: z.string().optional(),
  price: z.number().optional(),
  geoJson: z.object().optional(),
})
export const RESOLVE_TRAIN = {
  legs: { $each: RESOLVE_TRAIN_LEG },
}
export type Train = co.loaded<typeof Train, typeof RESOLVE_TRAIN>

export const Transportation = co.discriminatedUnion("type", [
  GenericTransportation,
  Flight,
  Train,
])
export type Transportation = co.loaded<typeof Transportation>
export type LoadedTransportation = Flight | Train | GenericTransportation

export const Trip = co.map({
  name: z.string(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  activities: co.list(Activity),
  accommodation: co.list(Accommodation),
  transportation: co.list(Transportation),
})
export const RESOLVE_TRIP = {
  activities: { $each: RESOLVE_ACTIVITY },
  accommodation: { $each: RESOLVE_ACCOMMODATION },
  transportation: { $each: true },
}
export type Trip = co.loaded<typeof Trip, typeof RESOLVE_TRIP>

export const AccountRoot = co.map({
  trips: co.list(Trip),
})
export const RESOLVE_ROOT = {
  trips: { $each: RESOLVE_TRIP },
}
export type AccountRoot = co.loaded<typeof AccountRoot, typeof RESOLVE_ROOT>

export const JazzAccount = co
  .account({
    root: AccountRoot,
    profile: co.profile(),
  })
  .withMigration(async account => {
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        trips: [],
      })
    }
  })
export const RESOLVE_ACCOUNT = {
  profile: true,
  root: RESOLVE_ROOT,
}
export type JazzAccount = co.loaded<typeof JazzAccount, typeof RESOLVE_ACCOUNT>
