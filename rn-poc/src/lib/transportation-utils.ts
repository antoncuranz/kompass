import type { co } from "jazz-tools"
import type {
  Flight,
  FlightLeg,
  GenericTransportation,
  Train,
  TrainLeg,
  Transportation,
} from "../schema"

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

export async function loadTransportation(
  t:
    | co.loaded<typeof Flight>
    | co.loaded<typeof Train>
    | co.loaded<typeof GenericTransportation>,
): Promise<Transportation> {
  switch (t.type) {
    case "flight": {
      const flight = t as co.loaded<typeof Flight>
      await Promise.all(
        flight.legs.map(async leg => {
          const l = leg as co.loaded<typeof FlightLeg>
          await l.$jazz.ensureLoaded({
            resolve: { origin: true, destination: true },
          })
        }),
      )
      return flight
    }
    case "train": {
      const train = t as co.loaded<typeof Train>
      await Promise.all(
        train.legs.map(async leg => {
          const l = leg as co.loaded<typeof TrainLeg>
          await l.$jazz.ensureLoaded({
            resolve: { origin: true, destination: true },
          })
        }),
      )
      return train
    }
    case "generic":
      return t as co.loaded<typeof GenericTransportation>
  }
}
