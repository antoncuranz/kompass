import { useAccount, useCoState } from "jazz-tools/react-core"
import type { TripStorage } from "@/usecase/contracts"
import type { MaybeTrip, Trip } from "@/domain"
import type { co } from "jazz-tools"
import { SharedTripEntity, UserAccount } from "@/repo/jazzSchema"
import { dateFromString } from "@/lib/datetime-utils"
// eslint-disable @typescript-eslint/no-misused-spread

function mapTrip(entity: co.loaded<typeof SharedTripEntity>): Trip {
  return {
    stid: entity.$jazz.id,
    tid: entity.$jazz.id,
    ...entity.trip,
  }
}

export function useTrips(): TripStorage {
  const entities = useAccount(UserAccount, {
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
    update: () => {},
  }
}

export function useTrip(stid: string): MaybeTrip {
  const entity = useCoState(SharedTripEntity, stid)

  return entity.$isLoaded ? mapTrip(entity) : entity.$jazz.loadingState
}

// function createUserGroups() {
//   const admins = Group.create()

//   const members = Group.create()
//   members.addMember(admins)

//   const guests = Group.create()
//   guests.addMember(members)

//   const workers = Group.create()
//   workers.addMember(admins)

//   return { admins, members, guests, workers }
// }

// export function createNewTrip(
//   account: co.loaded<typeof UserAccount>,
//   values: {
//     name: string
//     startDate: string
//     endDate: string
//     description?: string
//     imageUrl?: string
//   },
// ) {
//   const { admins, members, guests, workers } = createUserGroups()

//   const sharedTripGroup = Group.create()
//   sharedTripGroup.addMember("everyone", "reader")
//   sharedTripGroup.addMember(admins)

//   const tripGroup = Group.create()
//   tripGroup.addMember(admins)
//   tripGroup.addMember(members)
//   tripGroup.addMember(guests)

//   const requestsGroup = Group.create()
//   requestsGroup.addMember("everyone", "writeOnly")
//   requestsGroup.addMember(admins)

//   const transportationGroup = Group.create()
//   transportationGroup.addMember(tripGroup)
//   transportationGroup.addMember(workers)

//   const filesGroup = Group.create()
//   filesGroup.addMember(members)

//   const trip = Trip.create(
//     {
//       ...values,
//       activities: [],
//       accommodation: [],
//       notes: "",
//       transportation: co.list(Transportation).create([], transportationGroup),
//       files: co.list(FileAttachment).create([], filesGroup),
//     },
//     tripGroup,
//   )

//   const sharedTrip = SharedTripEntity.create(
//     {
//       trip,
//       admins,
//       members,
//       guests,
//       workers,
//       requests: JoinRequests.create({}, requestsGroup),
//       statuses: RequestStatuses.create({}, admins),
//     },
//     sharedTripGroup,
//   )

//   account.root.trips.$jazz.set(sharedTrip.$jazz.id, sharedTrip)
// }
