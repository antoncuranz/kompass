import { Group, co, z } from "jazz-tools"

export const LocationEntity = co.map({
  latitude: z.number(),
  longitude: z.number(),
})

export const ActivityEntity = co
  .map({
    name: z.string(),
    description: z.string().optional(),
    date: z.iso.date(),
    time: z.iso.time().optional(),
    price: z.number().optional(),
    address: z.string().optional(),
    location: LocationEntity.optional(),
  })
  .resolved({ location: LocationEntity.resolveQuery })

export const AccommodationEntity = co
  .map({
    name: z.string(),
    description: z.string().optional(),
    arrivalDate: z.iso.date(),
    departureDate: z.iso.date(),
    price: z.number().optional(),
    address: z.string().optional(),
    location: LocationEntity.optional(),
  })
  .resolved({ location: LocationEntity.resolveQuery })

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
    genericType: z.string(),
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

export const FileAttachmentEntity = co
  .map({
    name: z.string(),
    file: co.fileStream(),
    references: co.list(z.string()),
  })
  .resolved({
    references: true,
  })

export const TripEntity = co
  .map({
    name: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    activities: co.list(ActivityEntity),
    accommodation: co.list(AccommodationEntity),
    transportation: co.list(TransportationEntity),
    notes: co.richText(),
    files: co.list(FileAttachmentEntity),
  })
  // .withMigration(trip => {
  //   // consider making new attributes optional to prevent errors for users w/o write permissions
  //   if (!trip.$jazz.has("files")) {
  //     const files = co.list(FileAttachment).create([], {
  //       owner: trip.$jazz.owner,
  //       // IMPORTANT: prevents new attributes being overwritten during migrations of other clients
  //       unique: `files_${trip.$jazz.id}`,
  //     })
  //     trip.$jazz.set("files", files)
  //   }
  // })
  .resolved({
    activities: { $each: ActivityEntity.resolveQuery },
    accommodation: { $each: AccommodationEntity.resolveQuery },
    transportation: { $each: true },
    notes: true,
    files: { $each: FileAttachmentEntity.resolveQuery, $onError: "catch" },
  })

// COLLABORATION

export const JoinRequestStatus = z.enum(["pending", "approved", "rejected"])

export const AccountProfile = co.profile({
  avatar: co.image().optional(),
})

export const JoinRequestEntity = co
  .map({
    account: co.account({ root: co.map({}), profile: AccountProfile }),
    status: JoinRequestStatus,
    requestedAt: z.iso.datetime(),
  })
  .resolved({ account: { profile: AccountProfile.resolveQuery } })

export const RequestStatuses = co
  .record(z.string(), JoinRequestStatus)
  .resolved({ $each: true })

export const JoinRequests = co
  .record(z.string(), JoinRequestEntity)
  .resolved({ $each: JoinRequestEntity.resolveQuery, $onError: "catch" })

export const SharedTripEntity = co.map({
  trip: TripEntity,
  requests: JoinRequests,
  statuses: RequestStatuses,
  admins: Group, // write-access to SharedTripEntity
  members: Group, // write-access to Trip
  guests: Group, // read-access to less sensitive Trip data
  workers: Group, // necessary access for server workers
})
// .resolved({
//   trip: TripEntity.resolveQuery,
//   requests: JoinRequests.resolveQuery,
//   statuses: { $onError: "catch" },
//   admins: true,
//   members: true,
//   guests: true,
//   workers: true,
// })

export const AccountRoot = co
  .map({
    trips: co.record(z.string(), SharedTripEntity),
    tripMap: co.record(z.string(), SharedTripEntity), // deprecated
    requests: JoinRequests,
  })
  .resolved({
    trips: { $each: SharedTripEntity.resolveQuery },
    requests: JoinRequests.resolveQuery,
  })

export const UserAccount = co
  .account({
    root: AccountRoot,
    profile: AccountProfile,
  })
  .withMigration(async account => {
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        trips: {},
        tripMap: {},
        requests: {},
      })
      return
    }

    // V0 Migration - Root

    const { root } = await account.$jazz.ensureLoaded({
      resolve: { root: true },
    })

    // rename tripMap to trips
    root.$jazz.set("trips", root.tripMap)

    // V0 Migration - Trips

    const {
      root: { trips },
    } = await account.$jazz.ensureLoaded({
      resolve: {
        root: {
          trips: {
            $each: {
              admins: true,
              members: true,
              trip: { transportation: true },
            },
          },
        },
      },
    })

    for (const sharedTrip of Object.values(trips)) {
      if (!sharedTrip.$jazz.has("guests")) {
        const guests = Group.create()
        guests.addMember(sharedTrip.members)
        sharedTrip.$jazz.set("guests", guests)
      }

      if (!sharedTrip.$jazz.has("workers")) {
        const workers = Group.create()
        workers.addMember(sharedTrip.admins)
        sharedTrip.$jazz.set("workers", workers)
        sharedTrip.trip.transportation.$jazz.owner.addMember(workers)
      }
    }
  })
  .resolved({
    profile: AccountProfile.resolveQuery,
    root: AccountRoot.resolveQuery,
  })
