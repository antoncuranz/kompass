import { Group } from "jazz-tools"
import { mapActivity } from "./mappers"
import { ActivityEntity } from "./schema"
import type { ActivityMutations } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useActivityMutations(stid: string): ActivityMutations {
  return {
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
