import type {
  JoinRequestEntity,
  LocationEntity,
  PricingEntity,
} from "./schema"
import type { co } from "jazz-tools"
import type { JoinRequest, Location, Pricing } from "@/domain"
import type { JoinRequestEntityList } from "../trip/schema"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapLocation(
  entity: co.loaded<typeof LocationEntity>,
): Location {
  return {
    id: entity.$jazz.id,
    ...entity,
  }
}

export function mapPricing(
  entity: co.loaded<typeof PricingEntity> | undefined,
): Pricing | undefined {
  if (!entity) return undefined
  return {
    amountPaid: entity.amountPaid,
    amountRemaining: entity.amountRemaining,
    dueCurrency: entity.dueCurrency,
    dueDate: entity.dueDate,
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
  entity: co.loaded<typeof JoinRequestEntityList>,
): Map<string, JoinRequest> {
  const loadedRequests = Object.entries(entity).filter(
    ([, req]) => req.$isLoaded,
  ) as Array<[string, co.loaded<typeof JoinRequestEntity>]>

  return new Map(
    loadedRequests.map(([id, req]) => {
      return [id, mapJoinRequest(req)]
    }),
  )
}
