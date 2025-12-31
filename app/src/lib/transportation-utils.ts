import { Group } from "jazz-tools"
import type { co } from "jazz-tools"
import type { SharedTrip, Transportation } from "@/schema"
import { Flight, GenericTransportation, Train } from "@/schema"

export function addFlight(
  sharedTrip: co.loaded<typeof SharedTrip>,
  values: Omit<co.input<typeof Flight>, "type">,
) {
  const transportation = sharedTrip.trip.transportation

  const flightGroup = Group.create()
  flightGroup.addMember(transportation.$jazz.owner)
  flightGroup.addMember(sharedTrip.workers)

  const flight = Flight.create(
    {
      type: "flight",
      ...values,
    },
    flightGroup,
  )
  flight.pnrs.$jazz.owner.addMember(sharedTrip.members) // required because the PNR list has onInlineCreate: "newGroup"

  transportation.$jazz.push(flight)
}

export function updateFlight(
  flight: co.loaded<typeof Flight>,
  values: Omit<co.input<typeof Flight>, "type">,
) {
  flight.$jazz.applyDiff(values)
}

export async function loadTransportation(
  transportation: co.loaded<typeof Transportation>,
) {
  switch (transportation.type) {
    case "flight":
      return await transportation.$jazz.ensureLoaded({
        resolve: Flight.resolveQuery,
      })

    case "train":
      return await transportation.$jazz.ensureLoaded({
        resolve: Train.resolveQuery,
      })

    case "generic":
      return await transportation.$jazz.ensureLoaded({
        resolve: GenericTransportation.resolveQuery,
      })
  }
}

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
