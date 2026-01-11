import { HttpApiBuilder } from "@effect/platform"
import { NotFound, Unauthorized } from "@effect/platform/HttpApiError"
import { Effect } from "effect"
import { ServerWorkerApi } from "../api"
import { AuthRepository, StorageRepository } from "../repo/contracts"

export const SubscriptionsLive = HttpApiBuilder.group(
  ServerWorkerApi,
  "Subscriptions",
  handlers =>
    handlers
      .handle("get-subscriptions", req =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository
          const storage = yield* StorageRepository

          const userId = yield* auth
            .authenticateUser(req.request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          return yield* storage.getPushSubscriptions(userId).pipe(
            Effect.map(subs => subs.map(s => s.endpoint)),
            Effect.mapError(() => new Unauthorized()),
          )
        }),
      )
      .handle("add-subscription", ({ request, payload: subscription }) =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository
          const storage = yield* StorageRepository

          const userId = yield* auth
            .authenticateUser(request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          yield* storage
            .addPushSubscription(userId, subscription)
            .pipe(Effect.mapError(() => new Unauthorized()))
        }),
      )
      .handle("rm-subscription", req =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository
          const storage = yield* StorageRepository

          const userId = yield* auth
            .authenticateUser(req.request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          yield* storage
            .removePushSubscription(userId, req.payload)
            .pipe(Effect.mapError(() => new NotFound()))
        }),
      ),
)
