import { useCoState } from "jazz-tools/react-core"
import { mapAccommodation } from "./mappers"
import { AccommodationEntity } from "./schema"
import type { AccommodationSubscription } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useAccommodationSubscription(
  stid: string,
): AccommodationSubscription {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { accommodation: { $each: AccommodationEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.accommodation : []),
  })

  return {
    accommodation: entities.map(mapAccommodation),
  }
}
