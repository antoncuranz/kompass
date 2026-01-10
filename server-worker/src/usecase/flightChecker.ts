import { Effect } from "effect"
import type {
  CreateFlightLeg,
  FlightLeg,
  UpdateFlightLeg,
} from "../domain/transportation"
import { StorageRepository, TransportationRepository } from "../repo/contracts"
import { sendNotificationToUser } from "./notifications"

interface LegChange {
  field: keyof UpdateFlightLeg
  oldValue: any
  newValue: any
}

function compareLegs(
  oldLeg: FlightLeg,
  newLeg: CreateFlightLeg,
): Array<LegChange> {
  const changes: Array<LegChange> = []
  const fields: Array<keyof UpdateFlightLeg> = [
    "aircraft",
    "airline",
    "arrivalDateTime",
    "departureDateTime",
    "durationInMinutes",
    "flightNumber",
  ]

  for (const field of fields) {
    const oldValue = oldLeg[field]
    const newValue = newLeg[field]
    if (oldLeg[field] !== newValue) {
      changes.push({
        field,
        oldValue,
        newValue,
      })
    }
  }
  return changes
}

function formatChanges(changes: Array<LegChange>): string {
  return changes
    .map(c => `${String(c.field)}: ${c.oldValue} → ${c.newValue}`)
    .join(", ")
}

function isLegInFuture(leg: FlightLeg): boolean {
  // FIXME: tz not known
  const arrivalDate = new Date(leg.arrivalDateTime)
  return arrivalDate > new Date()
}

function getFlightDate(leg: FlightLeg): string {
  if (leg.amadeusFlightDate) {
    return leg.amadeusFlightDate
  }
  const datePart = leg.departureDateTime.split("T")[0]
  return datePart ?? leg.departureDateTime.substring(0, 10)
}

function sendScheduleChangeNotification(
  listId: string,
  flightNumber: string,
  changes: Array<LegChange>,
) {
  return Effect.gen(function* () {
    const storage = yield* StorageRepository
    const subscriberIds = yield* storage.getSubscribers(listId)
    if (subscriberIds.length === 0) {
      yield* Effect.log(`No subscribers for list ${listId}`)
      return
    }

    const notification = {
      title: `Flight ${flightNumber} Schedule Changed`,
      body: formatChanges(changes),
      icon: "https://kompa.ss/favicon.png",
    }

    for (const userId of subscriberIds) {
      yield* sendNotificationToUser(userId, notification)
    }
  })
}

function checkFlightLeg(listId: string, leg: FlightLeg) {
  return Effect.gen(function* () {
    if (!isLegInFuture(leg)) return

    const transportation = yield* TransportationRepository
    const storage = yield* StorageRepository

    const flightDate = getFlightDate(leg)

    // Fetch update
    const apiLeg = yield* transportation
      .fetchLeg({
        date: flightDate,
        flightNumber: leg.flightNumber,
        originAirport: leg.origin.iata,
      })
      .pipe(
        Effect.catchAll(e => {
          // Log and ignore fetch errors to avoid crashing the whole job
          return Effect.logError(
            `Failed to fetch leg ${leg.flightNumber}`,
            e,
          ).pipe(Effect.map(() => null)) // FIXME
        }),
      )

    if (!apiLeg) return

    const changes = compareLegs(leg, apiLeg)
    if (changes.length === 0) return

    yield* Effect.log(
      `Flight ${leg.flightNumber} has ${changes.length} changes: ${formatChanges(changes)}`,
    )

    let updateData: UpdateFlightLeg = {}
    for (const change of changes) {
      updateData[change.field] = change.newValue
    }

    yield* storage.updateFlightLeg(leg.id, updateData)
    yield* sendScheduleChangeNotification(listId, leg.flightNumber, changes)
  })
}

export function checkAllFlights() {
  return Effect.gen(function* () {
    yield* Effect.log("Starting flight schedule check...")

    const storage = yield* StorageRepository
    const listIds = yield* storage.getTransportationListIds()

    for (const listId of listIds) {
      const legs = yield* storage.getFlightLegs(listId).pipe(
        Effect.catchAll(e =>
          Effect.logError(`Failed to get flights for list ${listId}`, e).pipe(
            Effect.map(() => []), // FIXME
          ),
        ),
      )

      for (const leg of legs) {
        yield* checkFlightLeg(listId, leg)
      }
    }

    yield* Effect.log("Flight schedule check complete")
  })
}
