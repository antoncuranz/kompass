import { Data } from "effect"

export class RepositoryError extends Data.TaggedError("RepositoryError")<{
  message: string
  cause?: unknown
}> {}

export class EntityNotFoundError extends Data.TaggedError(
  "EntityNotFoundError",
)<{
  id: string
  entityType: string
}> {}

export class SubscriptionExpiredError extends Data.TaggedError(
  "SubscriptionExpiredError",
)<{
  endpoint: string
}> {}
