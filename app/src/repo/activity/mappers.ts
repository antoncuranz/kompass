import type { co } from "jazz-tools"
import type { ActivityEntity } from "@/repo/jazzSchema"
import type { Activity } from "@/domain"
import { mapLocation } from "@/repo/common/mappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapActivity(
  entity: co.loaded<typeof ActivityEntity>,
): Activity {
  return {
    id: entity.$jazz.id,
    ...entity,
    location: entity.location && mapLocation(entity.location),
  }
}
