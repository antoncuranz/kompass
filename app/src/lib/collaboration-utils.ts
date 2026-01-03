import { Group } from "jazz-tools"
import type { co } from "jazz-tools"
import type { SharedTripEntity, UserAccount } from "@/repo/jazzSchema"
import type { Trip } from "@/domain"
import { JoinRequest } from "@/repo/jazzSchema"

export function sendJoinRequest(
  sharedTrip: co.loaded<
    typeof SharedTripEntity,
    { requests: true; admins: true }
  >,
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

export enum UserRole {
  ADMIN = "Admin",
  MEMBER = "Member",
  GUEST = "Guest",
}

export function userHasRole(trip: Trip, role: UserRole) {
  return true
  switch (role) {
    case UserRole.ADMIN:
      return sharedTrip.admins.myRole() === "admin"
    case UserRole.MEMBER:
      return sharedTrip.members.myRole() === "writer"
    case UserRole.GUEST:
      return sharedTrip.guests.myRole() === "reader"
  }
}

export function approveJoinRequest(
  sharedTrip: co.loaded<
    typeof SharedTripEntity,
    { admins: true; members: true; guests: true; statuses: true; workers: true }
  >,
  joinRequest: co.loaded<typeof JoinRequest>,
  role: UserRole,
) {
  switch (role) {
    case UserRole.ADMIN:
      sharedTrip.admins.addMember(joinRequest.account, "admin")
      break
    case UserRole.MEMBER:
      sharedTrip.members.addMember(joinRequest.account, "writer")
      break
    case UserRole.GUEST:
      sharedTrip.guests.addMember(joinRequest.account, "reader")
      break
  }
  sharedTrip.statuses.$jazz.set(joinRequest.account.$jazz.id, "approved")
  joinRequest.$jazz.set("status", "approved")
}

export function rejectJoinRequest(
  sharedTrip: co.loaded<
    typeof SharedTripEntity,
    { members: true; statuses: true }
  >,
  joinRequest: co.loaded<typeof JoinRequest>,
) {
  sharedTrip.statuses.$jazz.set(joinRequest.account.$jazz.id, "rejected")
  joinRequest.$jazz.set("status", "rejected")
}
