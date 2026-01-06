import type { JoinRequestEntity, LocationEntity } from "./schema"
import type { co } from "jazz-tools"
import type { JoinRequest, Location } from "@/domain"
import type { JoinRequests } from "../trip/schema"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapLocation(
  entity: co.loaded<typeof LocationEntity>,
): Location {
  return {
    id: entity.$jazz.id,
    ...entity,
  }
}

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

export function mapJoinRequests(
  entity: co.loaded<typeof JoinRequests>,
): Map<string, JoinRequest> {
  return new Map(Object.entries(entity).map(([k, v]) => [k, mapJoinRequest(v)]))
}
