import { HttpApiBuilder } from "@effect/platform"
import {
  BadRequest,
  InternalServerError,
  NotFound,
  Unauthorized,
} from "@effect/platform/HttpApiError"
import type { HttpServerRequest } from "@effect/platform/HttpServerRequest"
import { Effect } from "effect"
import type { Schema } from "effect"
import type { Account } from "jazz-tools"
import { parseAuthToken } from "jazz-tools"
import { startWorker } from "jazz-tools/worker"
import webpush from "web-push"
import { ServerWorkerApi } from "./api"
import config from "./config"
import type { PushNotification, PushSubscription } from "./schema"
import { ServerWorkerAccount } from "./schema"

const jazzWorkerOptions = {
  syncServer: config.JAZZ_SYNC_URL,
  accountID: config.JAZZ_WORKER_ACCOUNT,
  accountSecret: config.JAZZ_WORKER_SECRET,
  AccountSchema: ServerWorkerAccount,
}

webpush.setVapidDetails(
  config.VAPID_SUBJECT,
  config.VAPID_PUBLIC_KEY,
  config.VAPID_PRIVATE_KEY,
)

// Jazz worker helpers

function withJazzWorker<A, E, R>(use: () => Effect.Effect<A, E, R>) {
  return Effect.acquireUseRelease(
    Effect.promise(() => startWorker(jazzWorkerOptions)),
    use,
    worker => Effect.promise(() => worker.shutdownWorker()),
  )
}

function withJazzWorkerAndAuth<A, E, R>(
  request: HttpServerRequest,
  use: (_: Account) => Effect.Effect<A, E, R>,
) {
  return withJazzWorker(() => Effect.andThen(authenticateRequest(request), use))
}

// Auth helpers

function authenticateRequest(request: HttpServerRequest) {
  return Effect.gen(function* () {
    const authHeader = request.headers["authorization"]
    if (!authHeader) {
      return yield* new BadRequest()
    }
    const authToken = authHeader.substring("Jazz ".length)

    const { account, error } = yield* Effect.tryPromise({
      try: () => parseAuthToken(authToken),
      catch: () => new Unauthorized(),
    })

    if (error) {
      return yield* new Unauthorized()
    }
    return account
  })
}

// Push notification helpers

function sendNotification(
  subscription: Schema.Schema.Type<typeof PushSubscription>,
  notification: Schema.Schema.Type<typeof PushNotification>,
) {
  return Effect.tryPromise({
    try: () =>
      webpush.sendNotification(subscription, JSON.stringify(notification)),
    catch: () => new InternalServerError(),
  })
}

// Subscription CRUD

const getSwAccount = Effect.tryPromise({
  try: () =>
    ServerWorkerAccount.getMe().$jazz.ensureLoaded({
      resolve: ServerWorkerAccount.resolveQuery,
    }),
  catch: () => new InternalServerError(),
})

function persistSubscription(
  account: Account,
  subscription: Schema.Schema.Type<typeof PushSubscription>,
) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    swAccount.root.pushSubscriptions.$jazz.set(account.$jazz.id, subscription)
  })
}

function retrieveSubscription(account: Account) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const subscription = swAccount.root.pushSubscriptions[account.$jazz.id]
    if (!subscription) {
      return yield* new NotFound()
    }
    return subscription
  })
}

function deleteSubscription(account: Account) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    swAccount.root.pushSubscriptions.$jazz.delete(account.$jazz.id)
    swAccount.root.transportationLists.$jazz.delete(account.$jazz.id)
  })
}

// API handlers

export const MainImpl = HttpApiBuilder.group(
  ServerWorkerApi,
  "Main",
  handlers =>
    handlers
      .handle("health", () => Effect.void)
      .handle("subscribe", ({ request, payload: subscription }) =>
        withJazzWorkerAndAuth(request, account =>
          persistSubscription(account, subscription),
        ),
      )
      .handle("unsubscribe", req =>
        withJazzWorkerAndAuth(req.request, account =>
          deleteSubscription(account),
        ),
      )
      .handle("send-notification", req =>
        withJazzWorkerAndAuth(req.request, acc =>
          Effect.gen(function* () {
            const subscription = yield* retrieveSubscription(acc)
            const notification = {
              title: "Test notification",
              body: "This is a test notification",
              icon: "https://kompa.ss/favicon.png",
            }
            yield* sendNotification(subscription, notification)
            return undefined
          }),
        ),
      )
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
      ),
)
