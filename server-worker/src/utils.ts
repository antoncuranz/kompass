import {
  BadRequest,
  InternalServerError,
  Unauthorized,
} from "@effect/platform/HttpApiError"
import type { HttpServerRequest } from "@effect/platform/HttpServerRequest"
import { Effect } from "effect"
import type { Account } from "jazz-tools"
import { parseAuthToken } from "jazz-tools"
import { startWorker } from "jazz-tools/worker"
import config from "./config"
import { ServerWorkerAccount } from "./repo/jazz"

const jazzWorkerOptions = {
  syncServer: config.JAZZ_SYNC_URL,
  accountID: config.JAZZ_WORKER_ACCOUNT,
  accountSecret: config.JAZZ_WORKER_SECRET,
  AccountSchema: ServerWorkerAccount,
}

// Hash utility

export function hash(value: string): string {
  const hasher = new Bun.CryptoHasher("sha512")
  hasher.update(value)
  return hasher.digest("hex")
}

// Jazz worker helpers

export function withJazzWorker<A, E, R>(use: () => Effect.Effect<A, E, R>) {
  return Effect.acquireUseRelease(
    Effect.promise(() => startWorker(jazzWorkerOptions)),
    use,
    worker => Effect.promise(() => worker.shutdownWorker()),
  )
}

export function withJazzWorkerAndAuth<A, E, R>(
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

// Server worker account

export const getSwAccount = Effect.tryPromise({
  try: () =>
    ServerWorkerAccount.getMe().$jazz.ensureLoaded({
      resolve: ServerWorkerAccount.resolveQuery,
    }),
  catch: () => new InternalServerError(),
})
