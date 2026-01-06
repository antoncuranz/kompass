import { Group, co } from "jazz-tools"
import { mapTrip } from "./mappers"
import {
  JoinRequestEntityList,
  RequestStatusEntityList,
  SharedTripEntity,
  TripEntity,
} from "./schema"
import type { TripRepository } from "@/repo/contracts"
import { TransportationEntity } from "@/repo/transportation/schema"
import { FileAttachmentEntity } from "@/repo/attachment/schema"
import { UserAccount } from "@/repo/user/schema"

function createUserGroups() {
  const admins = Group.create()

  const members = Group.create()
  members.addMember(admins)

  const guests = Group.create()
  guests.addMember(members)

  const workers = Group.create()
  workers.addMember(admins)

  return { admins, members, guests, workers }
}

export function useTripRepository(): TripRepository {
  return {
    create: async values => {
      const account = await UserAccount.getMe().$jazz.ensureLoaded({
        resolve: { root: { trips: true } },
      })

      const { admins, members, guests, workers } = createUserGroups()

      const sharedTripGroup = Group.create()
      sharedTripGroup.addMember("everyone", "reader")
      sharedTripGroup.addMember(admins)

      const tripGroup = Group.create()
      tripGroup.addMember(admins)
      tripGroup.addMember(members)
      tripGroup.addMember(guests)

      const requestsGroup = Group.create()
      requestsGroup.addMember("everyone", "writeOnly")
      requestsGroup.addMember(admins)

      const transportationGroup = Group.create()
      transportationGroup.addMember(tripGroup)
      transportationGroup.addMember(workers)

      const filesGroup = Group.create()
      filesGroup.addMember(members)

      const statusesGroup = Group.create()
      statusesGroup.addMember(admins)

      const trip = TripEntity.create(
        {
          ...values,
          activities: [],
          accommodation: [],
          notes: "",
          transportation: co
            .list(TransportationEntity)
            .create([], transportationGroup),
          files: co.list(FileAttachmentEntity).create([], filesGroup),
        },
        tripGroup,
      )

      const sharedTrip = SharedTripEntity.create(
        {
          trip,
          admins,
          members,
          guests,
          workers,
          requests: JoinRequestEntityList.create({}, requestsGroup),
          statuses: RequestStatusEntityList.create({}, statusesGroup),
        },
        sharedTripGroup,
      )

      account.root.trips.$jazz.set(sharedTrip.$jazz.id, sharedTrip)
      return mapTrip(sharedTrip)
    },

    update: async (stid, values) => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { notes: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      sharedTrip.trip.$jazz.applyDiff(values)
      return mapTrip(sharedTrip)
    },

    remove: async stid => {
      const account = await UserAccount.getMe().$jazz.ensureLoaded({
        resolve: { root: { trips: true } },
      })

      account.root.trips.$jazz.delete(stid)
      // TODO: think about revoking access
    },

    loadAll: async () => {
      const account = await UserAccount.getMe().$jazz.ensureLoaded({
        resolve: {
          root: {
            trips: {
              $each: { trip: { notes: true } },
            },
          },
        },
      })

      return Object.values(account.root.trips).map(mapTrip)
    },
  }
}
