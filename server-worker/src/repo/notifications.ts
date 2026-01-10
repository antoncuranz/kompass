import { Effect, Layer } from "effect"
import type { WebPushError } from "web-push"
import webpush from "web-push"
import { RepositoryError, SubscriptionExpiredError } from "../domain/errors"
import type { PushNotification, PushSubscription } from "../domain/notification"
import { NotificationRepository } from "./contracts"
import config from "../config"

const NotificationRepositoryImpl = NotificationRepository.of({
  send: (
    subscription: PushSubscription,
    notification: PushNotification,
  ): Effect.Effect<void, RepositoryError | SubscriptionExpiredError> => {
    return Effect.tryPromise({
      try: () =>
        webpush.sendNotification(subscription, JSON.stringify(notification), {
          vapidDetails: {
            subject: config.VAPID_SUBJECT,
            publicKey: config.VAPID_PUBLIC_KEY,
            privateKey: config.VAPID_PRIVATE_KEY,
          },
        }),
      catch: error => error as WebPushError,
    }).pipe(
      Effect.catchAll(
        (
          error,
        ): Effect.Effect<void, RepositoryError | SubscriptionExpiredError> => {
          if (error.statusCode === 410) {
            return Effect.fail(
              new SubscriptionExpiredError({ endpoint: subscription.endpoint }),
            )
          }
          return Effect.fail(
            new RepositoryError({
              message: "Failed to send push notification",
              cause: error,
            }),
          )
        },
      ),
    )
  },
})

export const NotificationRepositoryLive = Layer.succeed(
  NotificationRepository,
  NotificationRepositoryImpl,
)
