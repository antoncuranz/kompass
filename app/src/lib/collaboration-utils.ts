import { Group } from "jazz-tools"
import {
  JoinRequestEntity,
  SharedTripEntity,
  UserAccount,
} from "@/repo/jazzSchema"
import type { UserRole } from "@/domain"

export async function sendJoinRequest(stid: string, userId: string) {
  const sharedTrip = await SharedTripEntity.load(stid, {
    resolve: { admins: true, requests: true },
  })
  if (!sharedTrip.$isLoaded) {
    throw new Error(
      "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
    )
  }
  const account = await UserAccount.load(userId, {
    resolve: { root: { requests: true } },
  })
  if (!account.$isLoaded) {
    throw new Error("Unable to load UserAccount: " + account.$jazz.loadingState)
  }

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
  role: UserRole,
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
