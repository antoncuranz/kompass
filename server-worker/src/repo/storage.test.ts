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

describe("StorageRepository - Monitor Management CRUD", () => {
  it("should manage monitors (add, has, getSubscribers, remove)", async () => {
    const listId = "test-list-monitors"
    const userId1 = "monitor-user-1"
    const userId2 = "monitor-user-2"

    // Initially no monitor
    const initialHas = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.hasMonitor(listId, userId1)
      }),
    )
    expect(initialHas).toBe(false)

    // Initially no subscribers
    const initialSubscribers = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getSubscribers(listId)
      }),
    )
    expect(initialSubscribers).toEqual([])

    // Add first monitor
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.addMonitor(listId, userId1)
      }),
    )

    // Verify hasMonitor returns true
    const afterFirstAdd = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.hasMonitor(listId, userId1)
      }),
    )
    expect(afterFirstAdd).toBe(true)

    // Verify subscribers contains user1
    const subscribersAfterFirst = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getSubscribers(listId)
      }),
    )
    expect(subscribersAfterFirst).toContain(userId1)
    expect(subscribersAfterFirst).toHaveLength(1)

    // Add second monitor
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.addMonitor(listId, userId2)
      }),
    )

    // Verify both users are subscribers
    const subscribersAfterSecond = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getSubscribers(listId)
      }),
    )
    expect(subscribersAfterSecond).toContain(userId1)
    expect(subscribersAfterSecond).toContain(userId2)
    expect(subscribersAfterSecond).toHaveLength(2)

    // Remove first monitor
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.removeMonitor(listId, userId1)
      }),
    )

    // Verify user1 no longer has monitor
    const afterRemove = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.hasMonitor(listId, userId1)
      }),
    )
    expect(afterRemove).toBe(false)

    // Verify only user2 remains as subscriber
    const subscribersAfterRemove = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getSubscribers(listId)
      }),
    )
    expect(subscribersAfterRemove).toEqual([userId2])
  })

  it("should handle operations on non-existent lists/monitors gracefully", async () => {
    const listId = "non-existent-list"
    const userId = "non-existent-monitor-user"

    // hasMonitor for non-existent list returns false
    const hasMonitor = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.hasMonitor(listId, userId)
      }),
    )
    expect(hasMonitor).toBe(false)

    // getSubscribers for non-existent list returns empty
    const subscribers = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getSubscribers(listId)
      }),
    )
    expect(subscribers).toEqual([])

    // removeMonitor for non-existent list does not throw
    await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        yield* storage.removeMonitor(listId, userId)
      }),
    )
  })
})

describe("StorageRepository - Transportation Lists and Debug", () => {
  it("should get transportation list IDs and debug info", async () => {
    // getTransportationListIds returns an array (may be empty or have data from other tests)
    const listIds = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getTransportationListIds()
      }),
    )
    expect(Array.isArray(listIds)).toBe(true)

    // getDebugInfo returns a JSON string
    const debugInfo = await runWithStorage(
      Effect.gen(function* () {
        const storage = yield* StorageRepository
        return yield* storage.getDebugInfo()
      }),
    )
    expect(typeof debugInfo).toBe("string")
    const parsed = JSON.parse(debugInfo)
    expect(parsed).toHaveProperty("pushSubscriptions")
    expect(parsed).toHaveProperty("transportationLists")
  })
})
