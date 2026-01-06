import { useCoState } from "jazz-tools/react"
import { useEffect, useState } from "react"
import { loadAndMapTransportation } from "./mappers"
import type { TransportationEntity } from "./schema"
import type { TransportationSubscription } from "@/repo/contracts"
import type { co } from "jazz-tools"
import type { Transportation } from "@/domain"
import { SharedTripEntity } from "@/repo/trip/schema"

const EMPTY_ARRAY: Array<co.loaded<typeof TransportationEntity>> = []

export function useTransportationSubscription(
  stid: string,
): TransportationSubscription {
  const entities = useCoState(SharedTripEntity, stid, {
    resolve: {
      trip: { transportation: { $each: true } },
    },
    select: st => (st.$isLoaded ? st.trip.transportation : EMPTY_ARRAY),
  })
  const [transportation, setTransportation] = useState<Array<Transportation>>(
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      const result = await Promise.all(entities.map(loadAndMapTransportation))
      if (!cancelled) {
        setTransportation(result)
      }
    }

    void loadAll()

    return () => {
      cancelled = true
    }
  }, [entities])

  return {
    transportation,
  }
}
