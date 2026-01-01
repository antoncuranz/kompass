import { Schema } from "effect"
import { co, z } from "jazz-tools"

// Jazz CoValue Schemas

const PushSubscriptionEntity = co
  .map({
    endpoint: z.string(),
    expirationTime: z.number().nullish(),
    keys: co.map({
      p256dh: z.string(),
      auth: z.string(),
    }),
  })
  .resolved({ keys: true })

export const ServerWorkerAccount = co
  .account({
    root: co.map({
      // hash(user.$jazz.id) => set(pushSubscription) (key: endpoint)
      pushSubscriptions: co.record(
        z.string(),
        co.record(z.string(), PushSubscriptionEntity),
      ),
      // transportationList.$jazz.id => set(hash(user.$jazz.id)) (value: isSubscribed, should always be true)
      transportationLists: co.record(
        z.string(),
        co.record(z.string(), z.boolean()),
      ),
    }),
    profile: co.profile(),
  })
  .withMigration(account => {
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        pushSubscriptions: {},
        transportationLists: {},
      })
    }
  })
  .resolved({
    profile: true,
    root: {
      pushSubscriptions: {
        $each: { $each: PushSubscriptionEntity.resolveQuery },
      },
      transportationLists: { $each: { $each: true } },
    },
  })

// Effect Schemas

export const PushSubscriptionEndpoint = Schema.String

export const PushSubscription = Schema.Struct({
  endpoint: PushSubscriptionEndpoint,
  expirationTime: Schema.NullishOr(Schema.Number),
  keys: Schema.Struct({
    p256dh: Schema.String,
    auth: Schema.String,
  }),
})

export const PushNotification = Schema.Struct({
  title: Schema.String,
  body: Schema.String,
  icon: Schema.String,
})
