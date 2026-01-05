import { Group } from "jazz-tools"
import type { GrantedRole } from "@/domain"
import { JoinRequestEntity } from "@/repo/common/schema"
import { SharedTripEntity } from "@/repo/trip/schema"
import { UserAccount } from "@/repo/user/schema"

export async function sendJoinRequest(stid: string) {
  const sharedTrip = await SharedTripEntity.load(stid, {
    resolve: { admins: true, requests: true },
  })
  if (!sharedTrip.$isLoaded) {
    throw new Error(
      "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
    )
  }
  const account = await UserAccount.getMe().$jazz.ensureLoaded({
    resolve: { root: { requests: true } },
  })

  const now = new Date().toISOString()

  const requestGroup = Group.create(account)
  requestGroup.addMember(sharedTrip.admins)

  const request = JoinRequestEntity.create(
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

export async function approveJoinRequest(
  stid: string,
  joinRequestId: string,
  role: GrantedRole,
) {
  const sharedTrip = await SharedTripEntity.load(stid, {
    resolve: {
      admins: true,
      members: true,
      guests: true,
      statuses: true,
    },
  })
  if (!sharedTrip.$isLoaded) {
    throw new Error(
      "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
    )
  }

  const joinRequest = await JoinRequestEntity.load(joinRequestId, {
    resolve: { account: true },
  })
  if (!joinRequest.$isLoaded) {
    throw new Error(
      "Unable to load JoinRequestEntity: " + joinRequest.$jazz.loadingState,
    )
  }

  switch (role) {
    case "admin":
      sharedTrip.admins.addMember(joinRequest.account, "admin")
      break
    case "member":
      sharedTrip.members.addMember(joinRequest.account, "writer")
      break
    case "guest":
      sharedTrip.guests.addMember(joinRequest.account, "reader")
      break
  }
  sharedTrip.statuses.$jazz.set(joinRequest.account.$jazz.id, "approved")
  joinRequest.$jazz.set("status", "approved")
}

export async function rejectJoinRequest(stid: string, joinRequestId: string) {
  const sharedTrip = await SharedTripEntity.load(stid, {
    resolve: {
      statuses: true,
    },
  })
  if (!sharedTrip.$isLoaded) {
    throw new Error(
      "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
    )
  }

  const joinRequest = await JoinRequestEntity.load(joinRequestId, {
    resolve: true,
  })
  if (!joinRequest.$isLoaded) {
    throw new Error(
      "Unable to load JoinRequestEntity: " + joinRequest.$jazz.loadingState,
    )
  }

  sharedTrip.statuses.$jazz.set(joinRequest.account.$jazz.id, "rejected")
  joinRequest.$jazz.set("status", "rejected")
}
