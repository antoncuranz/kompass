import { createJazzTestAccount, setupJazzTestSync } from "jazz-tools/testing"
import { Effect } from "effect"
import { ServerWorkerAccount } from "../repo/jazz"
import { beforeEach, vi } from "vitest"

// Re-export vi.mock helper to be used in test files
export { vi }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let testAccount: any

export async function setupTestEnvironment() {
  await setupJazzTestSync()
  testAccount = await createJazzTestAccount({
    AccountSchema: ServerWorkerAccount,
    isCurrentActiveAccount: true,
  })
  return testAccount
}

export function getTestAccount() {
  return testAccount
}

/**
 * Helper to run an Effect and return the result for assertions.
 * Throws if the effect fails.
 */
export async function runEffect<A, E>(effect: Effect.Effect<A, E>): Promise<A> {
  return Effect.runPromise(effect)
}

// Setup mock for jazz-worker before each test
beforeEach(async () => {
  await setupTestEnvironment()

  // Mock the jazz-worker module to use test account instead of real worker
  vi.mock("../repo/jazz-worker", () => {
    return {
      withJazzWorker: <A, E, R>(use: () => Effect.Effect<A, E, R>) => use(),
      getSwAccount: Effect.promise(() =>
        testAccount.$jazz.ensureLoaded({
          resolve: ServerWorkerAccount.resolveQuery,
        }),
      ),
    }
  })
})
