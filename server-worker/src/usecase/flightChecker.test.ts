import { describe, expect, it, vi } from "vitest"
import { Effect, Redacted } from "effect"
import { checkAllFlights } from "./flightChecker"
import {
  NotificationRepository,
  StorageRepository,
  TransportationRepository,
} from "../repo/contracts"
import { AppConfig } from "../config"
import type { FlightLeg } from "../domain/transportation"

const config = {
  jazzSyncUrl: "ws://unused",
  jazzAccountId: "test",
  jazzAccountSecret: Redacted.make("test"),
  vapidSubject: "mailto:test@example.com",
  vapidPublicKey: "test",
  vapidPrivateKey: Redacted.make("test"),
  transportationApiUrl: "https://unused",
}

async function check(leg: FlightLeg) {
  const updateFlightLeg = vi.fn(() => Effect.void)
  const getSubscribers = vi.fn(() => Effect.succeed([]))
  const fetchLeg = vi.fn(() => Effect.succeed({ ...leg }))
  await Effect.runPromise(
    checkAllFlights().pipe(
      Effect.provideService(AppConfig, config),
      Effect.provideService(TransportationRepository, { fetchLeg }),
      Effect.provideService(NotificationRepository, {
        send: () => Effect.void,
      }),
      Effect.provideService(StorageRepository, {
        getDebugInfo: () => Effect.succeed(""),
        getTransportationListIds: () => Effect.succeed(["list"]),
        getFlightLegs: () => Effect.succeed([leg]),
        updateFlightLeg,
        hasMonitor: () => Effect.succeed(false),
        addMonitor: () => Effect.void,
        removeMonitor: () => Effect.void,
        getSubscribers,
        getPushSubscriptions: () => Effect.succeed([]),
        addPushSubscription: () => Effect.void,
        removePushSubscription: () => Effect.void,
      }),
    ),
  )
  return { fetchLeg, updateFlightLeg, getSubscribers }
}

const leg: FlightLeg = {
  id: "leg",
  origin: { iata: "SYD" },
  airline: "Emirates",
  flightNumber: "EK 412",
  departureDateTime: "2099-01-31T08:45:00",
  arrivalDateTime: "2099-01-31T14:00:00",
  amadeusFlightDate: "2099-01-30",
  durationInMinutes: 195,
}

describe("AeroDataBox refresh dates", () => {
  it.each([
    { name: "legacy through-flight date", amadeusFlightDate: "2099-01-30" },
    { name: "no stored date", amadeusFlightDate: undefined },
  ])(
    "uses the local departure date with $name",
    async ({ amadeusFlightDate }) => {
      const { fetchLeg, updateFlightLeg, getSubscribers } = await check({
        ...leg,
        amadeusFlightDate,
      })
      expect(fetchLeg).toHaveBeenCalledWith({
        date: "2099-01-31",
        flightNumber: "EK 412",
        originAirport: "SYD",
      })
      expect(updateFlightLeg).not.toHaveBeenCalled()
      expect(getSubscribers).not.toHaveBeenCalled()
    },
  )
})
