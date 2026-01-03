import { useAccount, useCoState } from "jazz-tools/react-core"
import { useEffect, useState } from "react"
import { mapUserRole } from "./userRepo"
import type { TripRepo } from "@/usecase/contracts"
import type { Maybe, Trip, TripMeta, User } from "@/domain"
import type { Group, co } from "jazz-tools"
import { SharedTripEntity, UserAccount } from "@/repo/jazzSchema"
import { dateFromString } from "@/lib/datetime-utils"
// eslint-disable @typescript-eslint/no-misused-spread

async function mapGroup(
  group: Group,
  includeAdmins = false,
): Promise<Array<User>> {
  const loaded = await Promise.all(
    group
      .getDirectMembers()
      .filter(member => member.role !== "admin" || includeAdmins)
      .map(member =>
        UserAccount.load(member.account.$jazz.id, {
          resolve: { profile: { avatar: true } },
        }),
      ),
  )

  return loaded
    .filter(account => account.$isLoaded)
    .map(account => {
      return {
        id: account.$jazz.id,
        name: account.profile.name,
        avatarImageId: account.profile.avatar?.$jazz.id,
        joinRequests: new Map(),
      }
    })
}

async function mapTripMeta(
  entity: co.loaded<typeof SharedTripEntity>,
): Promise<TripMeta> {
  return {
    stid: entity.$jazz.id,
    myRole: mapUserRole(entity),
    admins: await mapGroup(entity.admins, true),
    members: await mapGroup(entity.members),
    guests: await mapGroup(entity.guests),
    workers: await mapGroup(entity.workers),
    joinRequests: [],
  }
}

function mapTrip(entity: co.loaded<typeof SharedTripEntity>): Trip {
  return {
    stid: entity.$jazz.id,
    tid: entity.trip.$jazz.id,
    ...entity.trip,
  }
}

export function useTripRepo(): TripRepo {
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

export function useTrip(stid: string): Maybe<Trip> {
  const entity = useCoState(SharedTripEntity, stid)

  return entity.$isLoaded ? mapTrip(entity) : entity.$jazz.loadingState
}

export function useTripMeta(stid: string): Maybe<TripMeta> {
  const entity = useCoState(SharedTripEntity, stid)
  const [mapped, setMapped] = useState<Maybe<TripMeta>>("loading")

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!entity.$isLoaded) {
        setMapped(entity.$jazz.loadingState)
        return
      }

      const result = await mapTripMeta(entity)
      if (!cancelled) {
        setMapped(result)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [entity])

  return mapped
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
