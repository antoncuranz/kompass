import { useCoState } from "jazz-tools/react-core"
import { mapActivity } from "./mappers"
import { ActivityEntity } from "./schema"
import type { ActivitySubscription } from "@/repo/contracts"
import type { co } from "jazz-tools"
import { SharedTripEntity } from "@/repo/trip/schema"
import { Activity } from "@/domain"

const EMPTY_ARRAY: Array<co.loaded<typeof ActivityEntity>> = []

export function useActivitySubscription(stid: string): ActivitySubscription {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { activities: { $each: ActivityEntity.resolveQuery } },
    },
    select: st => (st.$isLoaded ? st.trip.activities : EMPTY_ARRAY),
  })

  return {
    activities: entities
      .map(mapActivity)
      .filter(a => Activity.safeParse(a).success), // prevents loading problems during creation of new entities
  }
}
