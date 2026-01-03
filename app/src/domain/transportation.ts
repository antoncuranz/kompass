import * as z from "zod"
import { CreateLocation, Flight, Location, Train } from "./"

const GenericTransportation = z.object({
  id: z.string(),
  type: z.literal("generic"),
  name: z.string(),
  genericType: z.string(),
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  origin: Location,
  destination: Location,
  originAddress: z.string().optional(),
  destinationAddress: z.string().optional(),
  price: z.number().optional(),
  geoJson: z.object().optional(),
})
export type GenericTransportation = z.infer<typeof GenericTransportation>

export const CreateGenericTransportation = z
  .object({
    ...GenericTransportation.shape,
    origin: CreateLocation,
    destination: CreateLocation,
  })
  .omit({ id: true, type: true })
export type CreateGenericTransportation = z.infer<
  typeof CreateGenericTransportation
>

export const UpdateGenericTransportation = CreateGenericTransportation.partial()
export type UpdateGenericTransportation = z.infer<
  typeof UpdateGenericTransportation
>

export const Transportation = z.union([Flight, Train, GenericTransportation])
export type Transportation = Flight | Train | GenericTransportation

export function getDepartureDateTime(transportation: Transportation): string {
  switch (transportation.type) {
    case "flight":
      return transportation.legs[0].departureDateTime

    case "train":
      return transportation.legs[0].departureDateTime

    case "generic":
      return transportation.departureDateTime
  }
}

export function getArrivalDateTime(transportation: Transportation): string {
  switch (transportation.type) {
    case "flight":
      return transportation.legs[transportation.legs.length - 1].arrivalDateTime

    case "train":
      return transportation.legs[transportation.legs.length - 1].arrivalDateTime

    case "generic":
      return transportation.arrivalDateTime
  }
}

export function getTransportationName(transportation: Transportation): string {
  switch (transportation.type) {
    case "flight": {
      const firstLeg = transportation.legs[0]
      const lastLeg = transportation.legs[transportation.legs.length - 1]
      return `Flight ${firstLeg.flightNumber} from ${firstLeg.origin.municipality} to ${lastLeg.destination.municipality}${transportation.legs.length > 1 ? ` (+${transportation.legs.length - 1})` : ""}`
    }
    case "train": {
      const firstLeg = transportation.legs[0]
      const lastLeg = transportation.legs[transportation.legs.length - 1]
      return `Train ${firstLeg.lineName} from ${firstLeg.origin.name} to ${lastLeg.destination.name}${transportation.legs.length > 1 ? ` (+${transportation.legs.length - 1})` : ""}`
    }
    case "generic":
      return transportation.name
  }
}

export function getTransportationShortName(
  transportation: Transportation,
): string {
  switch (transportation.type) {
    case "flight": {
      const firstLeg = transportation.legs[0]
      const lastLeg = transportation.legs[transportation.legs.length - 1]
      return `${firstLeg.origin.iata} → ${lastLeg.destination.iata}`
    }
    case "train": {
      const firstLeg = transportation.legs[0]
      const lastLeg = transportation.legs[transportation.legs.length - 1]
      return `${firstLeg.origin.name} → ${lastLeg.destination.name}`
    }
    case "generic":
      return transportation.name
  }
}
