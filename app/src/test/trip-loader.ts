import type { co } from "jazz-tools"
import { SharedTripEntity } from "@/repo/trip/schema"
import { LocationEntity } from "@/repo/common/schema"

// Test-specific resolve queries without $onError (tests have full permissions)
export const flightResolveQuery = {
  legs: {
    $each: {
      origin: { location: LocationEntity.resolveQuery },
      destination: { location: LocationEntity.resolveQuery },
    },
  },
  pnrs: { $each: true },
} as const

export const sharedTripResolveQuery = {
  trip: {
    activities: { $each: { location: true } },
    accommodation: { $each: { location: true } },
    transportation: { $each: true },
    files: { $each: { references: true } },
  },
  requests: { $each: true },
  statuses: true,
  admins: true,
  members: true,
  guests: true,
  workers: true,
} as const

export type LoadedSharedTrip = co.loaded<
  typeof SharedTripEntity,
  typeof sharedTripResolveQuery
>

export async function loadSharedTrip(stid: string): Promise<LoadedSharedTrip> {
  const sharedTrip = await SharedTripEntity.load(stid, {
    resolve: sharedTripResolveQuery,
  })
  if (!sharedTrip.$isLoaded) {
    throw new Error("SharedTrip not loaded")
  }
  return sharedTrip
}
