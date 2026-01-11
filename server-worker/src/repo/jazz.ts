import { co, z } from "jazz-tools"

// Jazz CoValue Schemas

export const PushSubscriptionEntity = co
  .map({
    endpoint: z.string(),
    expirationTime: z.number().nullish(),
    keys: co.map({
      p256dh: z.string(),
      auth: z.string(),
    }),
  })
  .resolved({ keys: true })

export const AirportEntity = co.map({
  iata: z.string(),
})

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
    origin: true,
    destination: true,
  })

export const FlightEntity = co
  .map({
    type: z.literal("flight"),
    legs: co.list(FlightLegEntity),
  })
  .resolved({
    legs: { $each: { ...FlightLegEntity.resolveQuery, $onError: "catch" } },
  })

export const TransportationEntity = co.discriminatedUnion("type", [
  FlightEntity,
])

export const ServerWorkerAccount = co
  .account({
    root: co.map({
      // user.$jazz.id => set(pushSubscription) (key: endpoint)
      pushSubscriptions: co.record(
        z.string(),
        co.record(z.string(), PushSubscriptionEntity),
      ),
      // transportationList.$jazz.id => set(user.$jazz.id) (value: isSubscribed, should always be true)
      transportationLists: co.record(
        z.string(),
        co.record(z.string(), z.boolean()),
      ),
    }),
    profile: co.profile(),
  })
  .withMigration(account => {
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        pushSubscriptions: {},
        transportationLists: {},
      })
    }
  })
  .resolved({
    profile: true,
    root: {
      pushSubscriptions: {
        $each: { $each: PushSubscriptionEntity.resolveQuery },
      },
      transportationLists: { $each: { $each: true } },
    },
  })
