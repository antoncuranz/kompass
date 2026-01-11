import { Effect } from "effect"
import { startWorker } from "jazz-tools/worker"
import config from "../config"
import { ServerWorkerAccount } from "./jazz"

const jazzWorkerOptions = {
  syncServer: config.JAZZ_SYNC_URL,
  accountID: config.JAZZ_WORKER_ACCOUNT,
  accountSecret: config.JAZZ_WORKER_SECRET,
  AccountSchema: ServerWorkerAccount,
}

export function withJazzWorker<A, E, R>(use: () => Effect.Effect<A, E, R>) {
  return Effect.acquireUseRelease(
    Effect.promise(async () => {
      const worker = await startWorker(jazzWorkerOptions)
      await worker.waitForConnection()
      return worker
    }),
    use,
    worker => Effect.promise(() => worker.shutdownWorker()),
  )
}

export const getSwAccount = Effect.promise(() =>
  ServerWorkerAccount.getMe().$jazz.ensureLoaded({
    resolve: ServerWorkerAccount.resolveQuery,
  }),
)
