import { Effect, Schedule } from "effect"
import { checkAllFlights } from "../usecase/flightChecker"

export const scheduledFlightChecker = Effect.repeat(
  checkAllFlights().pipe(
    Effect.catchAll(e => Effect.logError("Flight checker job failed", e)),
  ),
  Schedule.spaced("1 hour"),
)

export function startFlightChecker() {
  return Effect.fork(scheduledFlightChecker)
}
