import { Group } from "jazz-tools"
import { mapActivity } from "./mappers"
import { ActivityEntity } from "./schema"
import type { ActivityRepository } from "@/repo/contracts"
import { cleanupAttachmentReferences } from "@/repo/attachment/cleanup"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useActivityRepository(stid: string): ActivityRepository {
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

      await cleanupAttachmentReferences(stid, id)
      sharedTrip.trip.activities.$jazz.remove(t => t.$jazz.id === id)
    },

    loadAll: async () => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: {
          trip: { activities: { $each: ActivityEntity.resolveQuery } },
        },
      })

      if (!sharedTrip.$isLoaded) {
        throw new Error(`Failed to load activities for trip ${stid}`)
      }

      return sharedTrip.trip.activities.map(mapActivity)
    },
  }
}
