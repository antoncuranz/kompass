import { HttpApiBuilder } from "@effect/platform"
import { NotFound, Unauthorized } from "@effect/platform/HttpApiError"
import { Effect } from "effect"
import { ServerWorkerApi } from "../api"
import { AuthRepository, StorageRepository } from "../repo/contracts"

export const MonitorsLive = HttpApiBuilder.group(
  ServerWorkerApi,
  "Monitors",
  handlers =>
    handlers
      .handle("get-monitor", req =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository
          const storage = yield* StorageRepository

          const userId = yield* auth
            .authenticateUser(req.request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          const hasMonitor = yield* storage
            .hasMonitor(req.path.id, userId)
            .pipe(Effect.mapError(() => new NotFound()))

          if (!hasMonitor) {
            return yield* new NotFound()
          }
        }),
      )
      .handle("add-monitor", req =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository
          const storage = yield* StorageRepository

          const userId = yield* auth
            .authenticateUser(req.request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          yield* storage
            .addMonitor(req.path.id, userId)
            .pipe(Effect.mapError(() => new Unauthorized()))
        }),
      )
      .handle("rm-monitor", req =>
        Effect.gen(function* () {
          const auth = yield* AuthRepository
          const storage = yield* StorageRepository

          const userId = yield* auth
            .authenticateUser(req.request.headers["authorization"])
            .pipe(Effect.mapError(() => new Unauthorized()))

          yield* storage
            .removeMonitor(req.path.id, userId)
            .pipe(Effect.mapError(() => new Unauthorized()))
        }),
      ),
)
