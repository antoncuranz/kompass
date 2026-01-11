import { setupJazzTestSync } from "jazz-tools/testing"
import { Effect, Layer, Redacted } from "effect"
import { beforeEach } from "vitest"
import { AppConfig } from "../config"

/**
 * Helper to run an Effect and return the result for assertions.
 * Throws if the effect fails.
 */
export async function runEffect<A, E>(effect: Effect.Effect<A, E>): Promise<A> {
  return Effect.runPromise(effect)
}

// Setup mock for jazz-worker before each test
beforeEach(async () => {
  await setupJazzTestSync()
})

export const AppConfigTest = Layer.succeed(AppConfig, {
  jazzSyncUrl: "ws://test:4200",
  jazzAccountId: "test-account",
  jazzAccountSecret: Redacted.make("test-secret"),
  vapidSubject: "mailto:test@test.com",
  vapidPublicKey: "test-public-key",
  vapidPrivateKey: Redacted.make("test-private-key"),
  transportationApiUrl: "http://test:8080/api/v1",
})
