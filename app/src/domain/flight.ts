import * as z from "zod"
import { GeoJSONSchema } from "zod-geojson"
import { Location } from "./"

const Airport = z.object({
  iata: z.string(),
  name: z.string(),
  municipality: z.string(),
  location: Location,
})
export type Airport = z.infer<typeof Airport>

const FlightLeg = z.object({
  id: z.string(),
  origin: Airport,
  destination: Airport,
  airline: z.string(),
  flightNumber: z.string(),
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  amadeusFlightDate: z.iso.date().optional(),
  durationInMinutes: z.number(),
  aircraft: z.string().optional(),
})
export type FlightLeg = z.infer<typeof FlightLeg>
const CreateFlightLeg = FlightLeg.omit({ id: true })

const PNR = z.object({
  id: z.string(),
  airline: z.string(),
  pnr: z.string(),
})
export type PNR = z.infer<typeof PNR>
const CreatePNR = PNR.omit({ id: true })

export const Flight = z.object({
  id: z.string(),
  type: z.literal("flight"),
  legs: z.array(FlightLeg),
  pnrs: z.array(PNR),
  price: z.number().optional(),
  geoJson: GeoJSONSchema.optional(),
})
export type Flight = z.infer<typeof Flight>

export const CreateFlight = z
  .object({
    ...Flight.shape,
    legs: z.array(CreateFlightLeg),
    pnrs: z.array(CreatePNR),
  })
  .omit({ id: true, type: true })
export type CreateFlight = z.infer<typeof CreateFlight>

export const UpdateFlight = CreateFlight.partial()
export type UpdateFlight = z.infer<typeof UpdateFlight>
