import { Config, Context, Layer } from "effect"
import type { Redacted } from "effect/Redacted"

export class AppConfig extends Context.Tag("AppConfig")<
  AppConfig,
  {
    readonly jazzSyncUrl: string
    readonly jazzAccountId: string
    readonly jazzAccountSecret: Redacted<string>
    readonly vapidSubject: string
    readonly vapidPublicKey: string
    readonly vapidPrivateKey: Redacted<string>
    readonly transportationApiUrl: string
  }
>() {}

export const AppConfigLive = Layer.effect(
  AppConfig,
  Config.all({
    jazzSyncUrl: Config.string("JAZZ_SYNC_URL").pipe(
      Config.withDefault("ws://127.0.0.1:4200"),
    ),
    jazzAccountId: Config.string("JAZZ_WORKER_ACCOUNT"),
    jazzAccountSecret: Config.redacted("JAZZ_WORKER_SECRET"),
    vapidSubject: Config.string("VAPID_SUBJECT"),
    vapidPublicKey: Config.string("VAPID_PUBLIC_KEY"),
    vapidPrivateKey: Config.redacted("VAPID_PRIVATE_KEY"),
    transportationApiUrl: Config.string("TRANSPORTATION_API_URL").pipe(
      Config.withDefault("http://127.0.0.1:8080/api/v1"),
    ),
  }),
)
