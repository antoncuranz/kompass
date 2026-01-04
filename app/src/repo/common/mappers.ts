import type { LocationEntity } from "./schema"
import type { co } from "jazz-tools"
import type { Location } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapLocation(
  entity: co.loaded<typeof LocationEntity>,
): Location {
  return {
    id: entity.$jazz.id,
    ...entity,
  }
}
