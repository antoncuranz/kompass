import { useAccount } from "jazz-tools/react-core"
import { Group, co } from "jazz-tools"
import { mapTrip } from "./mappers"
import type { TripRepo } from "@/repo/contracts"
import type { Trip } from "@/domain"
import {
  FileAttachmentEntity,
  JoinRequests,
  RequestStatuses,
  SharedTripEntity,
  TransportationEntity,
  TripEntity,
  UserAccount,
} from "@/repo/jazzSchema"
import { dateFromString } from "@/lib/datetime-utils"
// eslint-disable @typescript-eslint/no-misused-spread

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

export function useTripRepo(): TripRepo {
  const entities = useAccount(UserAccount, {
    resolve: { root: { trips: { $each: { trip: { notes: true } } } } },
    select: account =>
      account.$isLoaded ? Object.values(account.root.trips) : [],
  })

  function sorted(trips: Array<Trip>) {
    return trips.sort((a: Trip, b: Trip) => {
      return (
        dateFromString(b.startDate).getTime() -
        dateFromString(a.startDate).getTime()
      )
    })
  }

  return {
    trips: sorted(entities.map(mapTrip)),

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
          requests: JoinRequests.create({}, requestsGroup),
          statuses: RequestStatuses.create({}, admins),
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
  }
}
