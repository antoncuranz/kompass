import { Schema } from "effect"
import { co, z } from "jazz-tools"

// Jazz CoValue Schemas

const PushSubscriptionJazz = co
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
      pushSubscriptions: co.record(z.string(), PushSubscriptionJazz),
      transportationLists: co.record(z.string(), co.list(z.string())),
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
      pushSubscriptions: { $each: PushSubscriptionJazz.resolveQuery },
      transportationLists: { $each: true },
    },
  })

// Effect Schemas

export const PushSubscription = Schema.Struct({
  endpoint: Schema.String,
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
