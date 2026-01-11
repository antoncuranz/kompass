import { describe, expect, it } from "vitest"
import { Effect, Layer } from "effect"
import { HttpClient, HttpClientResponse } from "@effect/platform"
import { TransportationRepository } from "./contracts"
import { TransportationRepositoryLive } from "./transportation"
import { AppConfigTest } from "../test/setup"
import mockFlightResponse from "../test/transportation-api-response.json"

function createMockHttpClient(
  jsonResponse: unknown,
): Layer.Layer<HttpClient.HttpClient> {
  return Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make(req =>
      Effect.succeed(
        HttpClientResponse.fromWeb(
          req,
          new Response(JSON.stringify(jsonResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ),
    ),
  )
}

function createFailingHttpClient(): Layer.Layer<HttpClient.HttpClient> {
  return Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make(() => Effect.fail(new Error("Network error") as never)),
  )
}

describe("TransportationRepository - fetchLeg", () => {
  it("should fetch flight leg and return parsed data", async () => {
    const request = {
      date: "2026-01-20",
      flightNumber: "LH 717",
      originAirport: "HND",
    }

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* TransportationRepository
        return yield* repo.fetchLeg(request)
      }).pipe(
        Effect.provide(
          TransportationRepositoryLive.pipe(
            Layer.provide(createMockHttpClient(mockFlightResponse)),
          ),
        ),
        Effect.provide(AppConfigTest),
      ),
    )

    expect(result).toEqual({
      aircraft: "Boeing 747-8i",
      airline: "Lufthansa",
      amadeusFlightDate: "2026-01-20",
      arrivalDateTime: "2026-01-20T19:00:00",
      departureDateTime: "2026-01-20T12:35:00",
      durationInMinutes: 865,
      flightNumber: "LH 717",
      origin: {
        iata: "HND",
      },
    })
  })

  it("should return RepositoryError when fetch fails", async () => {
    const request = {
      date: "2026-01-20",
      flightNumber: "LH 717",
      originAirport: "HND",
    }

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* TransportationRepository
        return yield* repo.fetchLeg(request)
      }).pipe(
        Effect.either,
        Effect.provide(
          TransportationRepositoryLive.pipe(
            Layer.provide(createFailingHttpClient()),
          ),
        ),
        Effect.provide(AppConfigTest),
      ),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("RepositoryError")
    }
  })

  it("should return RepositoryError when response schema is invalid", async () => {
    const request = {
      date: "2026-01-20",
      flightNumber: "LH 717",
      originAirport: "HND",
    }

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* TransportationRepository
        return yield* repo.fetchLeg(request)
      }).pipe(
        Effect.either,
        Effect.provide(
          TransportationRepositoryLive.pipe(
            Layer.provide(createMockHttpClient({ invalid: "response" })),
          ),
        ),
        Effect.provide(AppConfigTest),
      ),
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("RepositoryError")
    }
  })

  it("should handle null aircraft and amadeusFlightDate", async () => {
    const request = {
      date: "2026-01-20",
      flightNumber: "TA 123",
      originAirport: "BER",
    }

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const repo = yield* TransportationRepository
        return yield* repo.fetchLeg(request)
      }).pipe(
        Effect.provide(
          TransportationRepositoryLive.pipe(
            Layer.provide(
              createMockHttpClient({
                legs: [
                  {
                    origin: { iata: "BER" },
                    airline: "Test Airline",
                    flightNumber: "TA 123",
                    departureDateTime: "2026-01-20T10:00:00",
                    arrivalDateTime: "2026-01-20T14:00:00",
                    durationInMinutes: 240,
                    aircraft: null,
                    amadeusFlightDate: null,
                  },
                ],
              }),
            ),
          ),
        ),
        Effect.provide(AppConfigTest),
      ),
    )

    expect(result.aircraft).toBeUndefined()
    expect(result.amadeusFlightDate).toBeUndefined()
  })
})
