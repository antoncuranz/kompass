import { Effect, Layer, Schema } from "effect"
import { HttpClient, HttpClientRequest } from "@effect/platform"
import { RepositoryError } from "../domain/errors"
import type { FlightLegRequest } from "../domain/transportation"
import { TransportationRepository } from "./contracts"
import { AppConfig } from "../config"

// Internal API Schema
const ApiFlightLegSchema = Schema.Struct({
  aircraft: Schema.NullOr(Schema.String),
  airline: Schema.String,
  amadeusFlightDate: Schema.NullOr(Schema.String),
  arrivalDateTime: Schema.String,
  departureDateTime: Schema.String,
  durationInMinutes: Schema.Number,
  flightNumber: Schema.String,
  origin: Schema.Struct({
    iata: Schema.String,
  }),
})

const ApiFlightResponseSchema = Schema.Struct({
  legs: Schema.Array(ApiFlightLegSchema),
})

export const TransportationRepositoryLive = Layer.effect(
  TransportationRepository,
  Effect.gen(function* () {
    const config = yield* AppConfig
    const httpClient = yield* HttpClient.HttpClient

    return TransportationRepository.of({
      fetchLeg: (request: FlightLegRequest) => {
        return HttpClientRequest.post(
          `${config.transportationApiUrl}/flights`,
        ).pipe(
          HttpClientRequest.bodyJson({ legs: [request] }),
          Effect.andThen(HttpClient.execute),
          Effect.andThen(response => response.json),
          Effect.andThen(Schema.decodeUnknown(ApiFlightResponseSchema)),
          Effect.flatMap(response => {
            const apiLeg = response.legs[0]
            if (!apiLeg) {
              return Effect.fail(new Error("No leg found in response"))
            }

            return Effect.succeed({
              ...apiLeg,
              aircraft: apiLeg.aircraft ?? undefined,
              amadeusFlightDate: apiLeg.amadeusFlightDate ?? undefined,
            })
          }),
          Effect.catchAll(error =>
            Effect.fail(
              new RepositoryError({
                message: "Failed to fetch flight leg",
                cause: error,
              }),
            ),
          ),
          Effect.provideService(HttpClient.HttpClient, httpClient),
          Effect.scoped,
        )
      },
    })
  }),
)
