import { Effect, Redacted } from "effect"
import { startWorker } from "jazz-tools/worker"
import { AppConfig } from "../config"
import { ServerWorkerAccount } from "./jazz"

export function withJazzWorker<A, E, R>(use: () => Effect.Effect<A, E, R>) {
  return Effect.gen(function* () {
    const config = yield* AppConfig

    return yield* Effect.acquireUseRelease(
      Effect.promise(async () => {
        const worker = await startWorker({
          syncServer: config.jazzSyncUrl,
          accountID: config.jazzAccountId,
          accountSecret: Redacted.value(config.jazzAccountSecret),
          AccountSchema: ServerWorkerAccount,
        })
        await worker.waitForConnection()
        return worker
      }),
      use,
      worker => Effect.promise(() => worker.shutdownWorker()),
    )
  })
}

export const getSwAccount = Effect.promise(() =>
  ServerWorkerAccount.getMe().$jazz.ensureLoaded({
    resolve: ServerWorkerAccount.resolveQuery,
  }),
)
