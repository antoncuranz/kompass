import { Schema } from "effect"

const FlightLegSchema = Schema.Struct({
  id: Schema.String,
  origin: Schema.Struct({
    iata: Schema.String,
  }),
  destination: Schema.optional(
    Schema.Struct({
      iata: Schema.String,
    }),
  ),
  airline: Schema.String,
  flightNumber: Schema.String,
  departureDateTime: Schema.String,
  arrivalDateTime: Schema.String,
  amadeusFlightDate: Schema.optional(Schema.String),
  durationInMinutes: Schema.Number,
  aircraft: Schema.optional(Schema.String),
})

export type FlightLeg = Schema.Schema.Type<typeof FlightLegSchema>

const UpdateFlightLegSchema = Schema.mutable(
  FlightLegSchema.omit("id", "amadeusFlightDate"),
)
export type UpdateFlightLeg = Partial<
  Schema.Schema.Type<typeof UpdateFlightLegSchema>
>

const CreateFlightLegSchema = FlightLegSchema.omit("id")
export type CreateFlightLeg = Schema.Schema.Type<typeof CreateFlightLegSchema>

const FlightSchema = Schema.Struct({
  id: Schema.String,
  legs: Schema.Array(FlightLegSchema),
})

export type Flight = Schema.Schema.Type<typeof FlightSchema>

const FlightLegRequestSchema = Schema.Struct({
  date: Schema.String,
  flightNumber: Schema.String,
  originAirport: Schema.String,
})

export type FlightLegRequest = Schema.Schema.Type<typeof FlightLegRequestSchema>
