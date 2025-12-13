import { Group } from "jazz-tools"
import type { co } from "jazz-tools"
import type { UserAccount } from "@/schema"
import { JoinRequests, RequestStatuses, SharedTrip, Trip } from "@/schema"
import { loadTransportation } from "@/lib/transportation-utils"

export function createNewTrip(
  account: co.loaded<typeof UserAccount>,
  values: co.input<typeof Trip>,
) {
  const adminsGroup = Group.create()

  const membersGroup = Group.create()
  membersGroup.addMember(adminsGroup)

  const requestsGroup = Group.create()
  requestsGroup.addMember("everyone", "writeOnly")
  requestsGroup.addMember(adminsGroup)

  const publicGroup = Group.create()
  publicGroup.addMember("everyone", "reader")
  publicGroup.addMember(adminsGroup)

  const sharedTrip = SharedTrip.create(
    {
      trip: Trip.create(values, membersGroup),
      requests: JoinRequests.create({}, requestsGroup),
      statuses: RequestStatuses.create({}, adminsGroup),
      members: membersGroup,
      admins: adminsGroup,
    },
    publicGroup,
  )

  account.root.tripMap.$jazz.set(sharedTrip.$jazz.id, sharedTrip)
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
    Object.values(account.root.tripMap).map(exportTrip),
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
