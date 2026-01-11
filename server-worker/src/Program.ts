import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Schedule } from "effect"
import { AppConfigLive } from "./config"
import { ServerWorkerApi } from "./api"
import { MonitorsLive } from "./handlers/monitors"
import { ServiceLive } from "./handlers/service"
import { SubscriptionsLive } from "./handlers/subscriptions"
import { AuthRepositoryLive } from "./repo/auth"
import { NotificationRepositoryLive } from "./repo/notifications"
import { StorageRepositoryLive } from "./repo/storage"
import { TransportationRepositoryLive } from "./repo/transportation"
import { checkAllFlights } from "./usecase/flightChecker"

const RepoLayers = Layer.mergeAll(
  AuthRepositoryLive,
  StorageRepositoryLive,
  TransportationRepositoryLive,
  NotificationRepositoryLive,
).pipe(Layer.provideMerge(AppConfigLive))

const HttpApiLayers = HttpApiBuilder.api(ServerWorkerApi).pipe(
  Layer.provide(ServiceLive),
  Layer.provide(SubscriptionsLive),
  Layer.provide(MonitorsLive),
)

const Server = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiLayers),
  Layer.provide(BunHttpServer.layer({ port: 8080 })),
)

const scheduledFlightChecker = Effect.repeat(
  checkAllFlights().pipe(
    Effect.catchAll(e => Effect.logError("Flight checker job failed", e)),
  ),
  Schedule.spaced("1 hour"),
)

const program = Effect.gen(function* () {
  yield* Effect.fork(scheduledFlightChecker)
  yield* Layer.launch(Server)
})

program.pipe(Effect.provide(RepoLayers), BunRuntime.runMain)
