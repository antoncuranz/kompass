import { useCoState } from "jazz-tools/react-core"
import type { AccommodationStorage } from "@/usecase/contracts"
import type { AccommodationEntity } from "@/repo/jazzSchema"
import type { Accommodation } from "@/domain"
import type { co } from "jazz-tools"
import { SharedTripEntity } from "@/repo/jazzSchema"
import { mapLocation } from "@/repo/commonMappers"
// eslint-disable @typescript-eslint/no-misused-spread

export function useAccommodation(stid: string): AccommodationStorage {
  const entities = useCoState(SharedTripEntity, stid, {
    select: st => (st.$isLoaded ? st.trip.accommodation : []),
  })

  function mapAccommodation(
    entity: co.loaded<typeof AccommodationEntity>,
  ): Accommodation {
    return {
      id: entity.$jazz.id,
      ...entity,
      location: entity.location && mapLocation(entity.location),
    }
  }

  // TODO: make sure location is settable on update
  return {
    accommodation: entities.map(mapAccommodation),
    update: () => {},
  }
}
