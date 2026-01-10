import { Effect } from "effect"
import { NotificationRepository, StorageRepository } from "../repo/contracts"
import type { PushNotification } from "../domain/notification"

export const sendNotificationToUser = (
  userIdHash: string,
  notification: PushNotification,
) =>
  Effect.gen(function* () {
    const storage = yield* StorageRepository
    const notifications = yield* NotificationRepository

    const subscriptions = yield* storage.getPushSubscriptions(userIdHash).pipe(
      Effect.catchAll(e =>
        Effect.logError("Failed to get subscriptions", e).pipe(
          Effect.map(() => []), // FIXME
        ),
      ),
    )

    if (subscriptions.length === 0) {
      return
    }

    yield* Effect.forEach(
      subscriptions,
      subscription =>
        notifications.send(subscription, notification).pipe(
          Effect.catchTag("SubscriptionExpiredError", e =>
            Effect.gen(function* () {
              yield* Effect.log(
                `Subscription expired for user ${userIdHash}, removing endpoint ${e.endpoint}`,
              )
              yield* storage.removePushSubscription(userIdHash, e.endpoint)
            }),
          ),
          Effect.catchAll(e => Effect.logError("Failed to notify sub", e)),
        ),
      { concurrency: "inherit" },
    )
  })
