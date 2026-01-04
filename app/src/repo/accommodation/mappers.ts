import type { co } from "jazz-tools"
import type { AccommodationEntity } from "./schema"
import type { Accommodation } from "@/domain"
import { mapLocation } from "@/repo/common/mappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapAccommodation(
  entity: co.loaded<typeof AccommodationEntity>,
): Accommodation {
  return {
    id: entity.$jazz.id,
    ...entity,
    location: entity.location && mapLocation(entity.location),
  }
}
