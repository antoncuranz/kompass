import { HttpApiBuilder } from "@effect/platform"
import {
  Forbidden,
  InternalServerError,
  NotFound,
} from "@effect/platform/HttpApiError"
import { Effect } from "effect"
import type { Account } from "jazz-tools"
import { co } from "jazz-tools"
import { ServerWorkerApi } from "../api"
import { getSwAccount, hash, withJazzWorkerAndAuth } from "../utils"

// Monitor operations

function getMonitor(account: Account, coListId: string) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedUserId = hash(account.$jazz.id)
    const transportationLists = swAccount.root.transportationLists

    if (!(coListId in transportationLists)) {
      return yield* new NotFound()
    }

    const subscribers = transportationLists[coListId]
    if (!subscribers || !(hashedUserId in subscribers)) {
      return yield* new NotFound()
    }

    const coList = yield* Effect.tryPromise({
      try: () => co.list(co.map({})).load(coListId),
      catch: () => new InternalServerError(),
    })

    if (!coList.$isLoaded) {
      return yield* new Forbidden()
    }
  })
}

function addMonitor(account: Account, coListId: string) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedUserId = hash(account.$jazz.id)
    const transportationLists = swAccount.root.transportationLists

    if (!(coListId in transportationLists)) {
      transportationLists.$jazz.set(coListId, {})
    }

    const monitorSet = transportationLists[coListId]
    if (!monitorSet) {
      return yield* new InternalServerError()
    }

    monitorSet.$jazz.set(hashedUserId, true)
  })
}

function removeMonitor(account: Account, transportationListId: string) {
  return Effect.gen(function* () {
    const swAccount = yield* getSwAccount
    const hashedId = hash(account.$jazz.id)
    const transportationLists = swAccount.root.transportationLists

    if (!(transportationListId in transportationLists)) {
      return
    }

    const monitorSet = transportationLists[transportationListId]
    if (!monitorSet) {
      return
    }

    monitorSet.$jazz.delete(hashedId)
  })
}

// API handlers

export const MonitorsImpl = HttpApiBuilder.group(
  ServerWorkerApi,
  "Monitors",
  handlers =>
    handlers
      .handle("get-monitor", req =>
        withJazzWorkerAndAuth(req.request, account =>
          getMonitor(account, req.path.id),
        ),
      )
      .handle("add-monitor", req =>
        withJazzWorkerAndAuth(req.request, account =>
          addMonitor(account, req.path.id),
        ),
      )
      .handle("rm-monitor", req =>
        withJazzWorkerAndAuth(req.request, account =>
          removeMonitor(account, req.path.id),
        ),
      ),
)
