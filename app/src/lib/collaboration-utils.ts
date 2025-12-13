import { Group } from "jazz-tools"
import type { co } from "jazz-tools"
import type { SharedTrip, UserAccount } from "@/schema"
import { JoinRequest } from "@/schema"

export function sendJoinRequest(
  sharedTrip: co.loaded<typeof SharedTrip, { requests: true; admins: true }>,
  account: co.loaded<typeof UserAccount, { root: { requests: true } }>,
) {
  const now = new Date().toISOString()

  const requestGroup = Group.create(account)
  requestGroup.addMember(sharedTrip.admins)

  const request = JoinRequest.create(
    {
      account,
      status: "pending",
      requestedAt: now,
    },
    requestGroup,
  )

  sharedTrip.requests.$jazz.set(account.$jazz.id, request)
  account.root.requests.$jazz.set(sharedTrip.$jazz.id, request)
}

export function approveJoinRequest(
  sharedTrip: co.loaded<typeof SharedTrip, { members: true; statuses: true }>,
  joinRequest: co.loaded<typeof JoinRequest>,
  role: "reader" | "writer",
) {
  sharedTrip.members.addMember(joinRequest.account, role)
  sharedTrip.statuses.$jazz.set(joinRequest.account.$jazz.id, "approved")
  joinRequest.$jazz.set("status", "approved")
}

export function rejectJoinRequest(
  sharedTrip: co.loaded<typeof SharedTrip, { members: true; statuses: true }>,
  joinRequest: co.loaded<typeof JoinRequest>,
) {
  sharedTrip.statuses.$jazz.set(joinRequest.account.$jazz.id, "rejected")
  joinRequest.$jazz.set("status", "rejected")
}
