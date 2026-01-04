import type { co } from "jazz-tools"
import type { JoinRequestEntity } from "@/repo/common/schema"
import type { JoinRequests, SharedTripEntity } from "@/repo/trip/schema"
import type { UserAccount } from "./schema"
import type { JoinRequest, User, UserRole } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapJoinRequest(
  entity: co.loaded<typeof JoinRequestEntity>,
): JoinRequest {
  return {
    id: entity.$jazz.id,
    ...entity,
    user: {
      id: entity.account.$jazz.id,
      name: entity.account.profile.name,
      avatarImageId: entity.account.profile.avatar?.$jazz.id,
    },
  }
}

export function mapUser(entity: co.loaded<typeof UserAccount>): User {
  return {
    id: entity.$jazz.id,
    name: entity.profile.name,
    avatarImageId: entity.profile.avatar?.$jazz.id,
  }
}

export function mapJoinRequests(
  entity: co.loaded<typeof JoinRequests>,
): Map<string, JoinRequest> {
  const result = new Map(
    Object.entries(entity).map(([k, v]) => [k, mapJoinRequest(v)]),
  )

  return result
}

export function mapUserRole(
  entity: co.loaded<
    typeof SharedTripEntity,
    { admins: true; members: true; guests: true }
  >,
): UserRole {
  if (entity.admins.myRole() === "admin") return "admin"
  if (entity.members.myRole() === "writer") return "member"
  if (entity.guests.myRole() === "reader") return "guest"

  return "unauthorized"
}
