import { Group, co, z } from "jazz-tools"
import { AccountProfile } from "../common/schema"
import { JoinRequestEntityList, SharedTripEntity } from "@/repo/trip/schema"

const AccountRoot = co.map({
  trips: co.record(z.string(), SharedTripEntity),
  tripMap: co.optional(co.record(z.string(), SharedTripEntity)), // deprecated
  requests: JoinRequestEntityList,
})

export const UserAccount = co
  .account({
    root: AccountRoot,
    profile: AccountProfile,
  })
  .withMigration(async account => {
    if (!account.$jazz.has("root")) {
      account.$jazz.set("root", {
        trips: {},
        requests: {},
      })
      return
    }

    // V0 Migration - Root

    const { root } = await account.$jazz.ensureLoaded({
      resolve: { root: true },
    })

    if (root.$jazz.has("tripMap")) {
      if (!root.$jazz.has("trips")) {
        const { tripMap } = await root.$jazz.ensureLoaded({
          resolve: { tripMap: true },
        })
        if (!tripMap) throw new Error("Legacy trip map is missing")
        root.$jazz.set("trips", tripMap)
      }
      root.$jazz.delete("tripMap")
    }

    // V0 Migration - Trips

    const {
      root: { trips },
    } = await account.$jazz.ensureLoaded({
      resolve: {
        root: {
          trips: {
            $each: {
              admins: true,
              members: true,
              trip: { transportation: true },
            },
          },
        },
      },
    })

    for (const sharedTrip of Object.values(trips)) {
      if (!sharedTrip.$jazz.has("guests")) {
        const guests = Group.create()
        guests.addMember(sharedTrip.members)
        sharedTrip.$jazz.set("guests", guests)
      }

      if (!sharedTrip.$jazz.has("workers")) {
        const workers = Group.create()
        workers.addMember(sharedTrip.admins)
        sharedTrip.$jazz.set("workers", workers)
        sharedTrip.trip.transportation.$jazz.owner.addMember(workers)
      }
    }
  })
  .resolved({
    profile: AccountProfile.resolveQuery,
  })
