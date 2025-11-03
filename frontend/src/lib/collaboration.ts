import { type JazzAccount, JoinRequest, type RequestsList } from "@/schema"
import { Account, co, Group } from "jazz-tools"

export function createRequestsToJoin(owner: JazzAccount) {
  const requestsGroup = Group.create()
  requestsGroup.addMember(owner, "admin")
  requestsGroup.addMember("everyone", "writeOnly")

  return requestsGroup
}

export function sendJoinRequest(
  requestsList: co.loaded<typeof RequestsList>,
  account: Account,
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
) {
  const requestorAccount = joinRequest.account as JazzAccount
  if (requestorAccount) {
    targetGroup.addMember(requestorAccount, role)
    joinRequest.$jazz.set("status", "approved")
  }
}

export function rejectJoinRequest(joinRequest: JoinRequest) {
  joinRequest.$jazz.set("status", "rejected")
}

export function isGroupOwner(group: Group): boolean {
  return group.myRole() === "admin"
}
