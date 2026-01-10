import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform"
import { Effect, Layer, Schema } from "effect"
import config from "../config"
import { RepositoryError } from "../domain/errors"
import type { FlightLegRequest } from "../domain/transportation"

import { TransportationRepository } from "./contracts"

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

const TransportationRepositoryImpl = TransportationRepository.of({
  fetchLeg: (request: FlightLegRequest) => {
    return HttpClientRequest.post(
      `${config.TRANSPORTATION_API_URL}/flights`,
    ).pipe(
      HttpClientRequest.bodyJson({ legs: [request] }),
      Effect.andThen(HttpClient.execute),
      Effect.andThen(response => response.json),
      Effect.andThen(Schema.decodeUnknown(ApiFlightResponseSchema)),
      Effect.map(response => {
        const apiLeg = response.legs[0]
        if (!apiLeg) {
          throw new Error("No leg found in response")
        }

        return {
          ...apiLeg,
          aircraft: apiLeg.aircraft ?? undefined,
          amadeusFlightDate: apiLeg.amadeusFlightDate,
        }
      }),
      Effect.catchAll(error =>
        Effect.fail(
          new RepositoryError({
            message: "Failed to fetch flight leg",
            cause: error,
          }),
        ),
      ),
      Effect.scoped,
      Effect.provide(FetchHttpClient.layer),
    )
  },
})

export const TransportationRepositoryLive = Layer.succeed(
  TransportationRepository,
  TransportationRepositoryImpl,
)
