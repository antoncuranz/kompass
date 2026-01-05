import { useCoState } from "jazz-tools/react"
import { useEffect, useState } from "react"
import { mapFlight, mapGenericTransportation, mapTrain } from "./mappers"
import {
  FlightEntity,
  GenericTransportationEntity,
  TrainEntity,
} from "./schema"
import type { TransportationSubscription } from "@/repo/contracts"
import type { Transportation } from "@/domain"
import type { co } from "jazz-tools"
import type { TransportationEntity } from "./schema"
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

  async function loadAndMapTransportation(
    transportation: co.loaded<typeof TransportationEntity>,
  ): Promise<Transportation> {
    switch (transportation.type) {
      case "flight":
        return mapFlight(
          await transportation.$jazz.ensureLoaded({
            resolve: FlightEntity.resolveQuery,
          }),
        )

      case "train":
        return mapTrain(
          await transportation.$jazz.ensureLoaded({
            resolve: TrainEntity.resolveQuery,
          }),
        )

      case "generic":
        return mapGenericTransportation(
          await transportation.$jazz.ensureLoaded({
            resolve: GenericTransportationEntity.resolveQuery,
          }),
        )
    }
  }

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
