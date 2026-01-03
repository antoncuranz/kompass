import { useCoState } from "jazz-tools/react-core"
import type { ActivityStorage } from "@/usecase/contracts"
import type { ActivityEntity } from "@/repo/jazzSchema"
import type { Activity } from "@/domain"
import type { co } from "jazz-tools"
import { SharedTripEntity } from "@/repo/jazzSchema"
import { mapLocation } from "@/repo/commonMappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function useActivities(stid: string): ActivityStorage {
  const entities = useCoState(SharedTripEntity, stid, {
    select: st => (st.$isLoaded ? st.trip.activities : []),
  })

  function mapActivity(entity: co.loaded<typeof ActivityEntity>): Activity {
    return {
      id: entity.$jazz.id,
      ...entity,
      location: entity.location && mapLocation(entity.location),
    }
  }

  return {
    activities: entities.map(mapActivity),
    update: () => {},
  }
}
