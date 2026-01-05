import { Group } from "jazz-tools"
import { mapAccommodation } from "./mappers"
import { AccommodationEntity } from "./schema"
import type { AccommodationMutations } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useAccommodationMutations(
  stid: string,
): AccommodationMutations {
  return {
    create: async values => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { accommodation: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const accommodation = sharedTrip.trip.accommodation

      const group = Group.create()
      group.addMember(accommodation.$jazz.owner)

      const entity = AccommodationEntity.create(values, group)

      accommodation.$jazz.push(entity)
      return mapAccommodation(entity)
    },

    update: async (id, values) => {
      const entity = await AccommodationEntity.load(id)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load AccommodationEntity: " + entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      if (!entity.location) {
        entity.$jazz.set("location", values.location)
      }
      return mapAccommodation(entity)
    },

    remove: async id => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { accommodation: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      sharedTrip.trip.accommodation.$jazz.remove(t => t.$jazz.id === id)
    },
  }
}
