import { Effect, Layer } from "effect"
import { parseAuthToken } from "jazz-tools"
import { UnauthorizedError } from "../domain/auth"
import { AuthRepository } from "./contracts"
import { withJazzWorker } from "./jazz-worker"

const AuthRepositoryImpl = AuthRepository.of({
  authenticateUser: (authHeader: string | undefined) =>
    withJazzWorker(() =>
      Effect.gen(function* () {
        if (!authHeader) {
          return yield* new UnauthorizedError({
            message: "Missing auth header",
          })
        }

        const authToken = authHeader.substring("Jazz ".length)

        const { account, error } = yield* Effect.tryPromise({
          try: () => parseAuthToken(authToken),
          catch: () => new UnauthorizedError({ message: "Invalid auth token" }),
        })

        if (error) {
          return yield* new UnauthorizedError({ message: "Invalid auth token" })
        }

        return account.$jazz.id
      }),
    ),
})

export const AuthRepositoryLive = Layer.succeed(
  AuthRepository,
  AuthRepositoryImpl,
)
