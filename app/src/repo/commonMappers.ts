import type { LocationEntity } from "@/repo/jazzSchema"
import type { co } from "jazz-tools"
import type { Location, Trip } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function mapLocation(
  entity: co.loaded<typeof LocationEntity>,
): Location {
  return {
    id: entity.$jazz.id,
    ...entity,
  }
}

export function removeEntityReferences(trip: Trip, entityId: string): void {
  // trip.files.forEach(file => {
  //   file.references.$jazz.remove(ref => ref === entityId)
  // })
}
