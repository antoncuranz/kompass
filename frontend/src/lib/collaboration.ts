import {
  type JazzAccount,
  JoinRequest,
  type RequestsList,
  type SharedTrip,
} from "@/schema"
import { Group } from "jazz-tools"

export function createRequestsToJoin(owner: JazzAccount) {
  const requestsGroup = Group.create()
  requestsGroup.addMember(owner, "admin")
  requestsGroup.addMember("everyone", "writeOnly")

  return requestsGroup
}

export function sendJoinRequest(
  requestsList: RequestsList,
  account: JazzAccount,
) {
  const now = new Date().toISOString()

  const request = JoinRequest.create(
    {
      account,
      status: "pending",
      requestedAt: now,
    },
    requestsList.$jazz.owner,
  )

  requestsList.$jazz.push(request)
}

export function approveJoinRequest(
  joinRequest: JoinRequest,
  targetGroup: Group,
  role: "reader" | "writer",
  sharedTrip: SharedTrip,
) {
  const requestorAccount = joinRequest.account as JazzAccount
  if (requestorAccount) {
    targetGroup.addMember(requestorAccount, role)
    requestorAccount.root.trips.$jazz.push(sharedTrip)
    joinRequest.$jazz.set("status", "approved")
  }
}

export function rejectJoinRequest(joinRequest: JoinRequest) {
  joinRequest.$jazz.set("status", "rejected")
}

export function isGroupOwner(account: JazzAccount, group: Group): boolean {
  return group.myRole() === "admin"
}
