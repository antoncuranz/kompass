import { describe, expect, it } from "vitest"
import { Effect } from "effect"
import { StorageRepository } from "./contracts"
import { StorageRepositoryLive } from "./storage"
import type { AppConfig } from "../config"
import type { PushSubscription } from "../domain/notification"
import { AppConfigTest } from "../test/setup"

const mockSubscription: PushSubscription = {
  endpoint: "https://push.example.com/subscription/123",
  expirationTime: null,
  keys: {
    p256dh: "test-p256dh-key",
    auth: "test-auth-key",
  },
}

const mockSubscription2: PushSubscription = {
  endpoint: "https://push.example.com/subscription/456",
  expirationTime: null,
  keys: {
    p256dh: "test-p256dh-key-2",
    auth: "test-auth-key-2",
  },
}

function runWithStorage<A, E>(
  effect: Effect.Effect<A, E, StorageRepository | AppConfig>,
): Promise<A> {
  return Effect.runPromise(
    effect.pipe(
      Effect.provide(StorageRepositoryLive),
      Effect.provide(AppConfigTest),
    ),
  )
}

describe("StorageRepository - Push Subscription CRUD", () => {
  it("should manage push subscriptions (add, get, remove)", async () => {
    const userId = "test-user-crud"

    // Initially empty
    const initial = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getPushSubscriptions(userId)
      }),
    )
    expect(initial).toEqual([])

    // Add first subscription
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.addPushSubscription(userId, mockSubscription)
      }),
    )

    // Verify first subscription added
    const afterFirst = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getPushSubscriptions(userId)
      }),
    )
    expect(afterFirst).toHaveLength(1)
    expect(afterFirst[0]).toMatchObject({
      endpoint: mockSubscription.endpoint,
      keys: {
        p256dh: mockSubscription.keys.p256dh,
        auth: mockSubscription.keys.auth,
      },
    })

    // Add second subscription
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.addPushSubscription(userId, mockSubscription2)
      }),
    )

    // Verify both subscriptions present
    const afterSecond = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getPushSubscriptions(userId)
      }),
    )
    expect(afterSecond).toHaveLength(2)
    const endpoints = afterSecond.map(s => s.endpoint)
    expect(endpoints).toContain(mockSubscription.endpoint)
    expect(endpoints).toContain(mockSubscription2.endpoint)

    // Remove first subscription
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.removePushSubscription(userId, mockSubscription.endpoint)
      }),
    )

    // Verify only second subscription remains
    const afterRemove = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getPushSubscriptions(userId)
      }),
    )
    expect(afterRemove).toHaveLength(1)
    expect(afterRemove[0]?.endpoint).toBe(mockSubscription2.endpoint)
  })

  it("should handle operations on non-existent user/subscriptions gracefully", async () => {
    const userId = "non-existent-user"

    // Get subscriptions for non-existent user returns empty
    const result = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getPushSubscriptions(userId)
      }),
    )
    expect(result).toEqual([])

    // Remove non-existent subscription does not throw
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.removePushSubscription(userId, "non-existent-endpoint")
      }),
    )

    // Still returns empty
    const afterRemove = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getPushSubscriptions(userId)
      }),
    )
    expect(afterRemove).toEqual([])
  })
})
