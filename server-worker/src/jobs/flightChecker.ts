import { Effect, Schedule } from "effect"
import { checkAllFlights } from "../usecase/flightChecker"
import { withJazzWorker } from "../utils"

export const scheduledFlightChecker = Effect.repeat(
  withJazzWorker(checkAllFlights).pipe(
    Effect.catchAll(e => Effect.logError("Flight checker job failed", e)),
  ),
  Schedule.spaced("1 hour"),
)

export function startFlightChecker() {
  return Effect.fork(scheduledFlightChecker)
}

export const FlightCheckerHandler = () => withJazzWorker(checkAllFlights)
