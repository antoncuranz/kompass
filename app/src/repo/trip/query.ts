import { useCoState } from "jazz-tools/react-core"
import { useEffect, useState } from "react"
import { mapTrip, mapTripMeta } from "./mappers"
import { JoinRequestEntityList, SharedTripEntity } from "./schema"
import type { TripQuery } from "@/repo/contracts"
import type { TripMeta } from "@/domain"
import { Maybe } from "@/domain"

export function useTripQuery(stid: string | undefined): TripQuery {
  const metaEntity = useCoState(SharedTripEntity, stid, {
    resolve: {
      admins: true,
      members: true,
      guests: true,
      workers: true,
      requests: JoinRequestEntityList.resolveQuery,
    },
  })
  const tripEntity = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { notes: true },
    },
  })
  const [meta, setMeta] = useState<Maybe<TripMeta>>(Maybe.loading())

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!metaEntity.$isLoaded) {
        setMeta(Maybe.notLoaded(metaEntity.$jazz.loadingState))
        return
      }

      const result = await mapTripMeta(metaEntity)
      if (!cancelled) {
        setMeta(Maybe.of(result))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [metaEntity])

  return {
    trip: tripEntity.$isLoaded
      ? Maybe.of(mapTrip(tripEntity))
      : Maybe.notLoaded(tripEntity.$jazz.loadingState),
    meta,
  }
}
