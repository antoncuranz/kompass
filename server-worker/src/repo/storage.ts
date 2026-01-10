import { Effect, Layer } from "effect"
import { co } from "jazz-tools"
import { EntityNotFoundError, RepositoryError } from "../domain/errors"
import type { FlightLeg, UpdateFlightLeg } from "../domain/transportation"
import { FlightEntity, FlightLegEntity, TransportationEntity } from "./jazz"
import { getSwAccount } from "../utils"
import { StorageRepository } from "./contracts"
// eslint-disable @typescript-eslint/no-misused-spread

const StorageRepositoryImpl = StorageRepository.of({
  getTransportationListIds: () =>
    Effect.gen(function* () {
      const account = yield* getSwAccount
      return Object.keys(account.root.transportationLists)
    }).pipe(
      Effect.mapError(
        e =>
          new RepositoryError({ message: "Failed to get list IDs", cause: e }),
      ),
    ),

  getFlightLegs: (listId: string) =>
    Effect.gen(function* () {
      const transportationList = yield* Effect.promise(() =>
        co
          .list(TransportationEntity)
          .load(listId, { resolve: { $each: true } }),
      )

      if (!transportationList.$isLoaded) {
        return yield* Effect.fail(
          new EntityNotFoundError({
            id: listId,
            entityType: "TransportationList",
          }),
        )
      }

      const flights = transportationList
        .values()
        .filter(t => t.type === "flight")

      const loadedFlights = yield* Effect.forEach(flights, flight =>
        Effect.promise(() =>
          flight.$jazz.ensureLoaded({ resolve: FlightEntity.resolveQuery }),
        ),
      )

      return loadedFlights
        .flatMap(flight => Array.from(flight.legs.values()))
        .filter(leg => leg.$isLoaded)
        .map(leg => ({
          id: leg.$jazz.id,
          ...leg,
        }))
    }).pipe(
      Effect.catchAll(
        (
          e: unknown,
        ): Effect.Effect<
          Array<FlightLeg>,
          RepositoryError | EntityNotFoundError
        > => {
          if (e instanceof EntityNotFoundError) return Effect.fail(e)
          return Effect.fail(
            new RepositoryError({
              message: "Failed to get flights",
              cause: e,
            }),
          )
        },
      ),
    ),

  getSubscribers: (listId: string) =>
    Effect.gen(function* () {
      const account = yield* getSwAccount
      const subscribers = account.root.transportationLists[listId]
      if (!subscribers) {
        return []
      }
      return Object.keys(subscribers)
    }).pipe(
      Effect.mapError(
        e =>
          new RepositoryError({
            message: "Failed to get subscribers",
            cause: e,
          }),
      ),
    ),

  getPushSubscriptions: (userIdHash: string) =>
    Effect.gen(function* () {
      const account = yield* getSwAccount
      const subscriptionsMap = account.root.pushSubscriptions[userIdHash]
      if (!subscriptionsMap) {
        return []
      }

      return Object.values(subscriptionsMap).map(sub => ({
        endpoint: sub.endpoint,
        expirationTime: sub.expirationTime,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      }))
    }).pipe(
      Effect.mapError(
        e =>
          new RepositoryError({
            message: "Failed to get push subscriptions",
            cause: e,
          }),
      ),
    ),

  removePushSubscription: (userIdHash: string, endpoint: string) =>
    Effect.gen(function* () {
      const account = yield* getSwAccount
      const subscriptionsMap = account.root.pushSubscriptions[userIdHash]
      if (subscriptionsMap) {
        subscriptionsMap.$jazz.delete(endpoint)
      }
    }).pipe(
      Effect.mapError(
        e =>
          new RepositoryError({
            message: "Failed to remove subscription",
            cause: e,
          }),
      ),
    ),

  updateFlightLeg: (legId: string, values: UpdateFlightLeg) =>
    Effect.gen(function* () {
      const leg = yield* Effect.promise(() =>
        FlightLegEntity.load(legId, { resolve: FlightLegEntity.resolveQuery }),
      )

      if (!leg.$isLoaded) {
        return yield* Effect.fail(
          new EntityNotFoundError({ id: legId, entityType: "FlightLegEntity" }),
        )
      }

      const { aircraft, ...rest } = values

      yield* Effect.sync(() =>
        leg.$jazz.applyDiff({
          ...rest,
        }),
      )
      if (aircraft !== undefined) {
        yield* Effect.sync(() =>
          leg.$jazz.applyDiff({ aircraft: aircraft ?? undefined }),
        )
      }
    }).pipe(
      Effect.catchAll(
        (e): Effect.Effect<void, RepositoryError | EntityNotFoundError> => {
          if (e instanceof EntityNotFoundError) return Effect.fail(e)
          return Effect.fail(
            new RepositoryError({
              message: "Failed to update flight leg",
              cause: e,
            }),
          )
        },
      ),
    ),
})

export const StorageRepositoryLive = Layer.succeed(
  StorageRepository,
  StorageRepositoryImpl,
)
