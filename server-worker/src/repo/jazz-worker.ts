import { Effect, Redacted } from "effect"
import { startWorker } from "jazz-tools/worker"
import { AppConfig } from "../config"
import { ServerWorkerAccount } from "./jazz"
import type { co } from "jazz-tools"

export function withJazzWorker<A, E, R>(
  use: (
    worker: co.loaded<typeof ServerWorkerAccount>,
  ) => Effect.Effect<A, E, R>,
) {
  return Effect.gen(function* () {
    const config = yield* AppConfig

    return yield* Effect.acquireUseRelease(
      Effect.promise(async () => {
        const worker = await startWorker({
          syncServer: config.jazzSyncUrl,
          accountID: config.jazzAccountId,
          accountSecret: Redacted.value(config.jazzAccountSecret),
          AccountSchema: ServerWorkerAccount,
          asActiveAccount: false,
        })

        await worker.waitForConnection()
        const loaded = await worker.worker.$jazz.ensureLoaded({
          resolve: ServerWorkerAccount.resolveQuery,
        })
        if (!loaded.$isLoaded) {
          throw new Error("Unable to load ServerWorkerAccount")
        }

        return { ...worker, account: loaded }
      }),
      worker => use(worker.worker),
      worker => Effect.promise(() => worker.shutdownWorker()),
    )
  })
}
