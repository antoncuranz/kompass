import { Schema } from "effect"

export const PushSubscriptionSchema = Schema.Struct({
  endpoint: Schema.String,
  expirationTime: Schema.NullishOr(Schema.Number),
  keys: Schema.Struct({
    p256dh: Schema.String,
    auth: Schema.String,
  }),
})

export type PushSubscription = Schema.Schema.Type<typeof PushSubscriptionSchema>

export const PushSubscriptionEndpoint = Schema.String

const PushNotificationSchema = Schema.Struct({
  title: Schema.String,
  body: Schema.String,
  icon: Schema.String,
})

export type PushNotification = Schema.Schema.Type<typeof PushNotificationSchema>
