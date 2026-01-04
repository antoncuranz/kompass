import { useCoState } from "jazz-tools/react-core"
import { Group } from "jazz-tools"
import type { ActivityRepo } from "@/usecase/contracts"
import type { Activity } from "@/domain"
import type { co } from "jazz-tools"
import { ActivityEntity, SharedTripEntity } from "@/repo/jazzSchema"
import { mapLocation } from "@/repo/commonMappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function useActivityRepo(stid: string): ActivityRepo {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { activities: { $each: ActivityEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.activities : []),
  })

  function mapActivity(entity: co.loaded<typeof ActivityEntity>): Activity {
    return {
      id: entity.$jazz.id,
      ...entity,
      location: entity.location && mapLocation(entity.location),
    }
  }

  return {
    activities: entities.map(mapActivity),

    create: async values => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { activities: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const activities = sharedTrip.trip.activities

      const group = Group.create()
      group.addMember(activities.$jazz.owner)

      const entity = ActivityEntity.create(values, group)

      activities.$jazz.push(entity)
      return mapActivity(entity)
    },

    update: async (id, values) => {
      const entity = await ActivityEntity.load(id)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load ActivityEntity: " + entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      if (!entity.location) {
        entity.$jazz.set("location", values.location)
      }
      return mapActivity(entity)
    },

    remove: async id => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { activities: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      sharedTrip.trip.activities.$jazz.remove(t => t.$jazz.id === id)
    },
  }
}
