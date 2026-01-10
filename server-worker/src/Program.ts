import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { ServerWorkerApi } from "./api"
import { MonitorsImpl } from "./handlers/monitors"
import { ServiceImpl } from "./handlers/service"
import { SubscriptionsImpl } from "./handlers/subscriptions"
import { startFlightChecker } from "./jobs/flightChecker"
import { NotificationRepositoryLive } from "./repo/notifications"
import { StorageRepositoryLive } from "./repo/storage"
import { TransportationRepositoryLive } from "./repo/transportation"

const RepoLayers = Layer.mergeAll(
  StorageRepositoryLive,
  TransportationRepositoryLive,
  NotificationRepositoryLive,
)

const ServerWorkerImpl = HttpApiBuilder.api(ServerWorkerApi).pipe(
  Layer.provide(ServiceImpl),
  Layer.provide(SubscriptionsImpl),
  Layer.provide(MonitorsImpl),
)

const Server = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(ServerWorkerImpl),
  Layer.provide(BunHttpServer.layer({ port: 8080 })),
)

// Start flight checker in background, then launch server (which blocks)
startFlightChecker().pipe(
  Effect.andThen(Layer.launch(Server)),
  Effect.provide(RepoLayers),
  BunRuntime.runMain,
)
