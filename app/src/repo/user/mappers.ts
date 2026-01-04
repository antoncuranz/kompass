import type { co } from "jazz-tools"
import type {
  JoinRequestEntity,
  SharedTripEntity,
  UserAccount,
} from "@/repo/jazzSchema"
import type { JoinRequest, User, UserRole } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapJoinRequest(
  entity: co.loaded<typeof JoinRequestEntity>,
): JoinRequest {
  return {
    id: entity.$jazz.id,
    ...entity,
    account: {
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
    joinRequests: new Map(
      Object.entries(entity.root.requests).map(([k, v]) => [
        k,
        mapJoinRequest(v),
      ]),
    ),
  }
}

export function mapUserRole(
  entity: co.loaded<
    typeof SharedTripEntity,
    { admins: true; members: true; guests: true }
  >,
): UserRole | undefined {
  if (entity.admins.myRole() === "admin") return "admin"
  if (entity.members.myRole() === "writer") return "member"
  if (entity.guests.myRole() === "reader") return "guest"

  return undefined
}
