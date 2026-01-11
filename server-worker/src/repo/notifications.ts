import { Effect, Layer, Redacted } from "effect"
import type { WebPushError } from "web-push"
import webpush from "web-push"
import { RepositoryError, SubscriptionExpiredError } from "../domain/errors"
import type { PushNotification, PushSubscription } from "../domain/notification"
import { NotificationRepository } from "./contracts"
import { AppConfig } from "../config"

export const NotificationRepositoryLive = Layer.effect(
  NotificationRepository,
  Effect.gen(function* () {
    const config = yield* AppConfig

    return NotificationRepository.of({
      send: (
        subscription: PushSubscription,
        notification: PushNotification,
      ): Effect.Effect<void, RepositoryError | SubscriptionExpiredError> => {
        return Effect.tryPromise({
          try: () =>
            webpush.sendNotification(
              subscription,
              JSON.stringify(notification),
              {
                vapidDetails: {
                  subject: config.vapidSubject,
                  publicKey: config.vapidPublicKey,
                  privateKey: Redacted.value(config.vapidPrivateKey),
                },
              },
            ),
          catch: error => error as WebPushError,
        }).pipe(
          Effect.catchAll(
            (
              error,
            ): Effect.Effect<
              void,
              RepositoryError | SubscriptionExpiredError
            > => {
              if (error.statusCode === 410) {
                return Effect.fail(
                  new SubscriptionExpiredError({
                    endpoint: subscription.endpoint,
                  }),
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
  }),
)
