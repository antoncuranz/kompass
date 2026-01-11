import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { generateAuthToken } from "jazz-tools"
import { AuthRepository } from "./contracts"
import { AuthRepositoryLive } from "./auth"
import type { AppConfig } from "../config"
import { AppConfigTest } from "../test/setup"
import { withJazzWorker } from "./jazz-worker"

function runWithAuth<A, E>(
  effect: Effect.Effect<A, E, AuthRepository | AppConfig>,
): Promise<A> {
  return Effect.runPromise(
    effect.pipe(
      Effect.provide(AuthRepositoryLive),
      Effect.provide(AppConfigTest),
    ),
  )
}

describe("AuthRepository - Authentication", () => {
  it("should authenticate user with valid token and return account ID", async () => {
    const { accountId, authToken } = await runWithAuth(
      withJazzWorker(account =>
        Effect.sync(() => ({
          accountId: account.$jazz.id,
          authToken: generateAuthToken(account),
        })),
      ),
    )
    const authHeader = `Jazz ${authToken}`

    const result = await runWithAuth(
      Effect.gen(function* () {
        const auth = yield* AuthRepository
        return yield* auth.authenticateUser(authHeader)
      }),
    )

    expect(result).toBe(accountId)
  })

  it("should return UnauthorizedError for missing auth header", async () => {
    const result = await runWithAuth(
      Effect.gen(function* () {
        const auth = yield* AuthRepository
        return yield* auth.authenticateUser(undefined)
      }).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("UnauthorizedError")
      expect(result.left.message).toBe("Missing auth header")
    }
  })

  it("should return UnauthorizedError for invalid auth token", async () => {
    const authHeader = "Jazz invalid-token-here"

    const result = await runWithAuth(
      Effect.gen(function* () {
        const auth = yield* AuthRepository
        return yield* auth.authenticateUser(authHeader)
      }).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("UnauthorizedError")
    }
  })

  it("should return UnauthorizedError for malformed auth header", async () => {
    // Auth header without "Jazz " prefix would result in invalid token
    const authHeader = "Bearer some-token"

    const result = await runWithAuth(
      Effect.gen(function* () {
        const auth = yield* AuthRepository
        return yield* auth.authenticateUser(authHeader)
      }).pipe(Effect.either),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("UnauthorizedError")
    }
  })
})
