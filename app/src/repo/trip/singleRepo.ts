import { useCoState } from "jazz-tools/react-core"
import { useEffect, useState } from "react"
import { mapTrip, mapTripMeta } from "./mappers"
import { SharedTripEntity } from "./schema"
import type { TripMeta } from "@/domain"
import type { SingleTripRepo } from "@/repo/contracts"
import { Maybe } from "@/domain"
// eslint-disable @typescript-eslint/no-misused-spread

export function useSingleTripRepo(stid: string | undefined): SingleTripRepo {
  const metaEntity = useCoState(SharedTripEntity, stid, {
    resolve: {
      admins: true,
      members: true,
      guests: true,
      workers: true,
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
