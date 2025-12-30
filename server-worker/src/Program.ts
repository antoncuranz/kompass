import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"
import { ServerWorkerApi } from "./api"
import { MainImpl } from "./handlers"

const ServerWorkerImpl = HttpApiBuilder.api(ServerWorkerApi).pipe(
  Layer.provide(MainImpl),
)

const Server = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(ServerWorkerImpl),
  Layer.provide(BunHttpServer.layer({ port: 8080 })),
)

Layer.launch(Server).pipe(BunRuntime.runMain)
