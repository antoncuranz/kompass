import { HttpApiBuilder } from "@effect/platform"
import { InternalServerError, NotFound } from "@effect/platform/HttpApiError"
import { Effect, Either } from "effect"
import type { Schema } from "effect"
import type { Account } from "jazz-tools"
import webpush from "web-push"
import { ServerWorkerApi } from "../api"
import config from "../config"
import type { PushNotification, PushSubscription } from "../schema"
import {
  getSwAccount,
  hash,
  withJazzWorker,
  withJazzWorkerAndAuth,
} from "../utils"

webpush.setVapidDetails(
  config.VAPID_SUBJECT,
  config.VAPID_PUBLIC_KEY,
  config.VAPID_PRIVATE_KEY,
)

// Push notification helpers

function sendNotification(
  subscription: Schema.Schema.Type<typeof PushSubscription>,
  notification: Schema.Schema.Type<typeof PushNotification>,
) {
  return Effect.gen(function* () {
    const result = yield* Effect.tryPromise(() =>
      webpush.sendNotification(subscription, JSON.stringify(notification)),
    ).pipe(Effect.either)

    if (Either.isLeft(result)) {
      yield* Effect.logError("Failed to send push notification", result.left.error)
      return yield* new InternalServerError()
    }

    return result.right
  })
}

function getSubscriptionsForNotification(account: Account) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedId = hash(account.$jazz.id)
    const pushSubscriptions = swAccount.root.pushSubscriptions

    if (!(hashedId in pushSubscriptions)) {
      yield* Effect.logWarning(`No subscriptions found for hashed account ID: ${hashedId}`)
      return yield* new NotFound()
    }

    const userSubscriptions = pushSubscriptions[hashedId]
    if (!userSubscriptions || Object.keys(userSubscriptions).length === 0) {
      yield* Effect.logWarning(`Empty subscriptions for hashed account ID: ${hashedId}`)
      return yield* new NotFound()
    }

    return Object.values(userSubscriptions)
  })
}

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
            const subscriptions = yield* getSubscriptionsForNotification(acc)
            const notification = {
              title: "Test notification",
              body: "This is a test notification",
              icon: "https://kompa.ss/favicon.png",
            }
            for (const subscription of subscriptions) {
              yield* sendNotification(subscription, notification)
            }
          }),
        ),
      ),
)
