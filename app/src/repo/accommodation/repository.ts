import { Group } from "jazz-tools"
import { mapAccommodation } from "./mappers"
import { AccommodationEntity } from "./schema"
import type { AccommodationRepository } from "@/repo/contracts"
import { cleanupAttachmentReferences } from "@/repo/attachment/cleanup"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useAccommodationRepository(
  stid: string,
): AccommodationRepository {
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

      await cleanupAttachmentReferences(stid, id)
      sharedTrip.trip.accommodation.$jazz.remove(t => t.$jazz.id === id)
    },

    loadAll: async () => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: {
          trip: { accommodation: { $each: AccommodationEntity.resolveQuery } },
        },
      })

      if (!sharedTrip.$isLoaded) {
        throw new Error(`Failed to load accommodation for trip ${stid}`)
      }

      return sharedTrip.trip.accommodation.map(mapAccommodation)
    },
  }
}
