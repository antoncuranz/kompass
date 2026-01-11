import { HttpApiBuilder } from "@effect/platform"
import {
  InternalServerError,
  Unauthorized,
} from "@effect/platform/HttpApiError"
import { Effect } from "effect"
import { ServerWorkerApi } from "../api"
import { AuthRepository, StorageRepository } from "../repo/contracts"
import { checkAllFlights } from "../usecase/flightChecker"
import { sendNotificationToUser } from "../usecase/notifications"

export const ServiceLive = HttpApiBuilder.group(
  ServerWorkerApi,
  "Service",
  handlers =>
    handlers
      .handle("health", () => Effect.void)
      .handle("get-account", () =>
        Effect.gen(function* () {
          const storage = yield* StorageRepository
          const data = yield* storage.getDebugInfo()
          yield* Effect.log(data)
          return data
        }).pipe(Effect.catchAll(() => Effect.fail(new InternalServerError()))),
      )
      .handle("send-notification", req =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository

          const userId = yield* auth
            .authenticateUser(req.request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          const notification = {
            title: "Test notification",
            body: "This is a test notification",
            icon: "https://kompa.ss/favicon.png",
          }
          yield* sendNotificationToUser(userId, notification)
        }),
      )
      .handle("check-flights", () =>
        checkAllFlights().pipe(
          Effect.catchAll(() => Effect.fail(new InternalServerError())),
        ),
      ),
)
