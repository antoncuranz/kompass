import type { co } from "jazz-tools"
import type { ActivityEntity } from "./schema"
import type { Activity } from "@/domain"
import { mapLocation, mapPricing } from "@/repo/common/mappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapActivity(
  entity: co.loaded<typeof ActivityEntity>,
): Activity {
  return {
    id: entity.$jazz.id,
    ...entity,
    pricing: mapPricing(entity.pricing),
    location: entity.location && mapLocation(entity.location),
  }
}
