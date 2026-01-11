import { Effect, Layer } from "effect"
import { parseAuthToken } from "jazz-tools"
import { UnauthorizedError } from "../domain/auth"
import { withJazzWorker } from "./jazz-worker"
import { AuthRepository } from "./contracts"

export const AuthRepositoryLive = Layer.effect(
  AuthRepository,
  Effect.sync(() => {
    return AuthRepository.of({
      authenticateUser: (authHeader: string | undefined) =>
        withJazzWorker(swAccount =>
          Effect.gen(function* () {
            if (!authHeader) {
              return yield* new UnauthorizedError({
                message: "Missing auth header",
              })
            }

            const authToken = authHeader.substring("Jazz ".length)

            const { account, error } = yield* Effect.tryPromise({
              try: () => parseAuthToken(authToken, { loadAs: swAccount }),
              catch: () =>
                new UnauthorizedError({ message: "Invalid auth token" }),
            })

            if (error) {
              return yield* new UnauthorizedError({
                message: "Invalid auth token",
              })
            }

            return account.$jazz.id
          }),
        ),
    })
  }),
)
