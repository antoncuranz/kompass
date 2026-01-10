import { HttpApiBuilder } from "@effect/platform"
import { InternalServerError } from "@effect/platform/HttpApiError"
import { Effect } from "effect"
import { ServerWorkerApi } from "../api"
import {
  getSwAccount,
  hash,
  withJazzWorker,
  withJazzWorkerAndAuth,
} from "../utils"
import { checkAllFlights } from "../usecase/flightChecker"
import { sendNotificationToUser } from "../usecase/notifications"

// API handlers

export const ServiceImpl = HttpApiBuilder.group(
  ServerWorkerApi,
  "Service",
  handlers =>
    handlers
      .handle("health", () => Effect.void)
      .handle("get-account", () =>
        withJazzWorker(() =>
          Effect.gen(function* () {
            const acc = yield* getSwAccount
            const data = {
              pushSubscriptions: acc.root.pushSubscriptions.toJSON(),
              transportationLists: acc.root.transportationLists.toJSON(),
            }
            yield* Effect.log(data)
            return JSON.stringify(data)
          }),
        ),
      )
      .handle("send-notification", req =>
        withJazzWorkerAndAuth(req.request, acc =>
          Effect.gen(function* () {
            const userId = hash(acc.$jazz.id)
            const notification = {
              title: "Test notification",
              body: "This is a test notification",
              icon: "https://kompa.ss/favicon.png",
            }
            yield* sendNotificationToUser(userId, notification)
          }),
        ),
      )
      .handle("check-flights", () =>
        withJazzWorker(checkAllFlights).pipe(
          Effect.catchAll(() => Effect.fail(new InternalServerError())),
        ),
      ),
)
