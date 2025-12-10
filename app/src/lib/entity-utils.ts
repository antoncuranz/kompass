import type { co } from "jazz-tools"
import type { Trip } from "@/schema.ts"

function removeEntityReferences(
  trip: co.loaded<typeof Trip>,
  entityId: string,
): void {
  trip.files.forEach(file => {
    file.references.$jazz.remove(ref => ref === entityId)
  })
}

export function deleteActivity(
  trip: co.loaded<typeof Trip>,
  activityId: string,
): void {
  removeEntityReferences(trip, activityId)
  trip.activities.$jazz.remove(a => a.$jazz.id === activityId)
}

export function deleteAccommodation(
  trip: co.loaded<typeof Trip>,
  accommodationId: string,
): void {
  removeEntityReferences(trip, accommodationId)
  trip.accommodation.$jazz.remove(a => a.$jazz.id === accommodationId)
}

export function deleteTransportation(
  trip: co.loaded<typeof Trip>,
  transportationId: string,
): void {
  removeEntityReferences(trip, transportationId)
  trip.transportation.$jazz.remove(t => t.$jazz.id === transportationId)
}
