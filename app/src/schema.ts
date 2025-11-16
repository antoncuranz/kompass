import { Group, co, z } from "jazz-tools"

export const Location = co.map({
  latitude: z.number(),
  longitude: z.number(),
})

export const Activity = co
  .map({
    name: z.string(),
    description: z.string().optional(),
    date: z.iso.date(),
    time: z.iso.time().optional(),
    price: z.number().optional(),
    address: z.string().optional(),
    location: Location.optional(),
  })
  .resolved({ location: Location.resolveQuery })

export const Accommodation = co
  .map({
    name: z.string(),
    description: z.string().optional(),
    arrivalDate: z.iso.date(),
    departureDate: z.iso.date(),
    price: z.number().optional(),
    address: z.string().optional(),
    location: Location.optional(),
  })
  .resolved({ location: Location.resolveQuery })

export const Airport = co
  .map({
    iata: z.string(),
    name: z.string(),
    municipality: z.string(),
    location: Location,
  })
  .resolved({ location: Location.resolveQuery })

export const FlightLeg = co
  .map({
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
  .resolved({
    origin: Airport.resolveQuery,
    destination: Airport.resolveQuery,
  })

export const PNR = co.map({
  airline: z.string(),
  pnr: z.string(),
})

export const Flight = co
  .map({
    type: z.literal("flight"),
    legs: co.list(FlightLeg),
    pnrs: co.list(PNR),
    price: z.number().optional(),
    geoJson: z.object().optional(),
  })
  .resolved({
    legs: { $each: FlightLeg.resolveQuery },
    pnrs: { $each: PNR.resolveQuery, $onError: "catch" },
  })

export const TrainStation = co
  .map({
    id: z.string(),
    name: z.string(),
    location: Location,
  })
  .resolved({ location: Location.resolveQuery })

export const TrainLeg = co
  .map({
    origin: TrainStation,
    destination: TrainStation,
    departureDateTime: z.iso.datetime(),
    arrivalDateTime: z.iso.datetime(),
    durationInMinutes: z.number(),
    lineName: z.string(),
    operatorName: z.string(),
  })
  .resolved({
    origin: TrainStation.resolveQuery,
    destination: TrainStation.resolveQuery,
  })

export const Train = co
  .map({
    type: z.literal("train"),
    legs: co.list(TrainLeg),
    refreshToken: z.string().optional(),
    price: z.number().optional(),
    geoJson: z.object().optional(),
  })
  .resolved({
    legs: { $each: TrainLeg.resolveQuery },
  })

export const GenericTransportation = co
  .map({
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
  .resolved({
    origin: Location.resolveQuery,
    destination: Location.resolveQuery,
  })

export const Transportation = co.discriminatedUnion("type", [
  GenericTransportation,
  Flight,
  Train,
])
export type Transportation =
  | co.loaded<typeof Flight>
  | co.loaded<typeof Train>
  | co.loaded<typeof GenericTransportation>

export const Trip = co
  .map({
    name: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    activities: co.list(Activity),
    accommodation: co.list(Accommodation),
    transportation: co.list(Transportation),
  })
  .resolved({
    activities: { $each: Activity.resolveQuery },
    accommodation: { $each: Accommodation.resolveQuery },
    transportation: { $each: true },
  })

// COLLABORATION

export const JoinRequestStatus = z.enum(["pending", "approved", "rejected"])

export const JoinRequest = co
  .map({
    account: co.account(),
    status: JoinRequestStatus,
    requestedAt: z.iso.datetime(),
  })
  .resolved({ account: true })

export const RequestStatuses = co
  .record(z.string(), JoinRequestStatus)
  .resolved({ $each: true })

export const JoinRequests = co
  .record(z.string(), JoinRequest)
  .resolved({ $each: JoinRequest.resolveQuery, $onError: "catch" })

export const SharedTrip = co
  .map({
    trip: Trip,
    requests: JoinRequests,
    statuses: RequestStatuses,
    members: Group,
    admins: Group,
  })
  .resolved({
    trip: Trip.resolveQuery,
    requests: JoinRequests.resolveQuery,
    statuses: { $onError: "catch" },
    admins: true,
    members: true,
  })

export const AccountRoot = co
  .map({
    trips: co.list(SharedTrip),
    requests: JoinRequests,
  })
  .resolved({
    trips: { $each: SharedTrip.resolveQuery },
    requests: { $each: true },
  })

export const UserAccount = co
  .account({
    root: AccountRoot,
    profile: co.profile({
      avatar: co.image().optional(),
    }),
  })
  .withMigration(account => {
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        trips: [],
        requests: {},
      })
    }
  })
  .resolved({
    profile: true,
    root: AccountRoot.resolveQuery,
  })
