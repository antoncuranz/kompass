import { HttpApiBuilder } from "@effect/platform"
import { InternalServerError, NotFound } from "@effect/platform/HttpApiError"
import { Effect } from "effect"
import type { Account } from "jazz-tools"
import { ServerWorkerApi } from "../api"
import type { PushSubscription } from "../domain/notification"
import { getSwAccount, hash, withJazzWorkerAndAuth } from "../utils"

// Subscription operations

function getSubscriptions(account: Account) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedId = hash(account.$jazz.id)
    const pushSubscriptions = swAccount.root.pushSubscriptions

    if (!(hashedId in pushSubscriptions)) {
      return []
    }

    const userSubscriptions = pushSubscriptions[hashedId]
    if (!userSubscriptions) {
      return []
    }

    return Object.keys(userSubscriptions)
  })
}

function addSubscription(account: Account, subscription: PushSubscription) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedId = hash(account.$jazz.id)
    const pushSubscriptions = swAccount.root.pushSubscriptions

    if (!(hashedId in pushSubscriptions)) {
      pushSubscriptions.$jazz.set(hashedId, {})
    }

    const userSubscriptions = pushSubscriptions[hashedId]
    if (!userSubscriptions) {
      return yield* new InternalServerError()
    }

    userSubscriptions.$jazz.set(subscription.endpoint, subscription)
  })
}

function deleteSubscription(account: Account, endpoint: string) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedId = hash(account.$jazz.id)
    const pushSubscriptions = swAccount.root.pushSubscriptions

    if (!(hashedId in pushSubscriptions)) {
      return yield* new NotFound()
    }

    const userSubscriptions = pushSubscriptions[hashedId]
    if (!userSubscriptions || !(endpoint in userSubscriptions)) {
      return yield* new NotFound()
    }

    userSubscriptions.$jazz.delete(endpoint)
  })
}

// API handlers

export const SubscriptionsImpl = HttpApiBuilder.group(
  ServerWorkerApi,
  "Subscriptions",
  handlers =>
    handlers
      .handle("get-subscriptions", req =>
        withJazzWorkerAndAuth(req.request, account =>
          getSubscriptions(account),
        ),
      )
      .handle("add-subscription", ({ request, payload: subscription }) =>
        withJazzWorkerAndAuth(request, account =>
          addSubscription(account, subscription),
        ),
      )
      .handle("rm-subscription", req =>
        withJazzWorkerAndAuth(req.request, account =>
          deleteSubscription(account, req.payload),
        ),
      ),
)
