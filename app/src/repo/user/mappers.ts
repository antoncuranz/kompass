import type { co } from "jazz-tools"
import type { SharedTripEntity } from "@/repo/trip/schema"
import type { UserAccount } from "./schema"
import type { User, UserRole } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapUser(entity: co.loaded<typeof UserAccount>): User {
  return {
    id: entity.$jazz.id,
    name: entity.profile.name,
    avatarImageId: entity.profile.avatar?.$jazz.id,
  }
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
