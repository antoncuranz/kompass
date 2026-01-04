import { useCoState } from "jazz-tools/react-core"
import { useEffect, useState } from "react"
import { mapTrip, mapTripMeta } from "./mappers"
import type { Maybe, TripMeta } from "@/domain"
import type { SingleTripRepo } from "@/usecase/contracts"
import { SharedTripEntity } from "@/repo/jazzSchema"
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
  const [meta, setMeta] = useState<Maybe<TripMeta>>("loading")

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!metaEntity.$isLoaded) {
        setMeta(metaEntity.$jazz.loadingState)
        return
      }

      const result = await mapTripMeta(metaEntity)
      if (!cancelled) {
        setMeta(result)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [metaEntity])

  return {
    trip: tripEntity.$isLoaded
      ? mapTrip(tripEntity)
      : tripEntity.$jazz.loadingState,
    meta,
  }
}
