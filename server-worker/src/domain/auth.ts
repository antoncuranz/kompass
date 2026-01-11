import { Data } from "effect"

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  message?: string
}> {}

export class BadRequestError extends Data.TaggedError("BadRequestError")<{
  message?: string
}> {}
