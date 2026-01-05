import { useCoState } from "jazz-tools/react-core"
import { mapActivity } from "./mappers"
import { ActivityEntity } from "./schema"
import type { ActivitySubscription } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useActivitySubscription(stid: string): ActivitySubscription {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { activities: { $each: ActivityEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.activities : []),
  })

  return {
    activities: entities.map(mapActivity),
  }
}
