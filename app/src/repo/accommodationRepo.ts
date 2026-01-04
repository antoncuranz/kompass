import { useCoState } from "jazz-tools/react-core"
import { Group } from "jazz-tools"
import type { AccommodationRepo } from "@/usecase/contracts"
import type { Accommodation } from "@/domain"
import type { co } from "jazz-tools"
import { AccommodationEntity, SharedTripEntity } from "@/repo/jazzSchema"
import { mapLocation } from "@/repo/commonMappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function useAccommodationRepo(stid: string): AccommodationRepo {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { accommodation: { $each: AccommodationEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.accommodation : []),
  })

  function mapAccommodation(
    entity: co.loaded<typeof AccommodationEntity>,
  ): Accommodation {
    return {
      id: entity.$jazz.id,
      ...entity,
      location: entity.location && mapLocation(entity.location),
    }
  }

  return {
    accommodation: entities.map(mapAccommodation),

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
