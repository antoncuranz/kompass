import { Group, co } from "jazz-tools"
import type { UserAccount } from "@/schema"
import {
  FileAttachment,
  JoinRequests,
  RequestStatuses,
  SharedTrip,
  Transportation,
  Trip,
} from "@/schema"
import { loadTransportation } from "@/lib/transportation-utils"

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

export function createNewTrip(
  account: co.loaded<typeof UserAccount>,
  values: {
    name: string
    startDate: string
    endDate: string
    description?: string
    imageUrl?: string
  },
) {
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

  const trip = Trip.create(
    {
      ...values,
      activities: [],
      accommodation: [],
      notes: "",
      transportation: co.list(Transportation).create([], transportationGroup),
      files: co.list(FileAttachment).create([], filesGroup),
    },
    tripGroup,
  )

  const sharedTrip = SharedTrip.create(
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
}

async function exportTrip(sharedTrip: co.loaded<typeof SharedTrip>) {
  const transportation = await Promise.all(
    sharedTrip.trip.transportation.map(async t => await loadTransportation(t)),
  )
  return {
    id: sharedTrip.$jazz.id,
    transportation,
    ...sharedTrip.trip.toJSON(),
  }
}

export async function exportUserData(account: co.loaded<typeof UserAccount>) {
  const trips = await Promise.all(
    Object.values(account.root.trips).map(exportTrip),
  )

  return {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    account: {
      id: account.$jazz.id,
      name: account.profile.name,
      avatar: account.profile.avatar?.$jazz.id,
    },
    trips,
  }
}
