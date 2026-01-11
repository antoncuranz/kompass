import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ServerWorkerApi } from "./api"
import { MonitorsLive } from "./handlers/monitors"
import { ServiceLive } from "./handlers/service"
import { SubscriptionsLive } from "./handlers/subscriptions"
import { startFlightChecker } from "./jobs/flightChecker"
import { AuthRepositoryLive } from "./repo/auth"
import { NotificationRepositoryLive } from "./repo/notifications"
import { StorageRepositoryLive } from "./repo/storage"
import { TransportationRepositoryLive } from "./repo/transportation"

const RepoLayers = Layer.mergeAll(
  AuthRepositoryLive,
  StorageRepositoryLive,
  TransportationRepositoryLive,
  NotificationRepositoryLive,
)

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

startFlightChecker().pipe(
  Effect.andThen(Layer.launch(Server)),
  Effect.provide(RepoLayers),
  BunRuntime.runMain,
)
