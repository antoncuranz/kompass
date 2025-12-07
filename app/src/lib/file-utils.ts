import type { co } from "jazz-tools"
import { useEffect, useState } from "react"
import type { Trip } from "@/schema"
import {
  getDepartureDateTime,
  getTransportationShortName,
  loadTransportation,
} from "@/lib/utils"

export type EntityType = "activity" | "accommodation" | "transportation"

export type ResolvedReference = {
  id: string
  type: EntityType
  name: string
  date: string
  transportationType?: string
}

export async function resolveReference(
  trip: co.loaded<typeof Trip>,
  refId: string,
): Promise<ResolvedReference | null> {
  const activity = trip.activities.find(a => a.$jazz.id === refId)
  if (activity) {
    return {
      id: refId,
      type: "activity",
      name: activity.name,
      date: activity.date,
    }
  }

  const accommodation = trip.accommodation.find(a => a.$jazz.id === refId)
  if (accommodation) {
    return {
      id: refId,
      type: "accommodation",
      name: accommodation.name,
      date: accommodation.arrivalDate,
    }
  }

  const transportationItem = trip.transportation.find(t => t.$jazz.id === refId)
  if (transportationItem) {
    const loaded = await loadTransportation(transportationItem)
    const transportationType =
      loaded.type === "generic" ? loaded.genericType : loaded.type

    return {
      id: refId,
      type: "transportation",
      name: getTransportationShortName(loaded),
      date: getDepartureDateTime(loaded).substring(0, 10),
      transportationType,
    }
  }

  return null
}

export function useReferencedItem(
  trip: co.loaded<typeof Trip>,
  refId: string,
): ResolvedReference | null {
  const [item, setItem] = useState<ResolvedReference | null>(null)

  useEffect(() => {
    void resolveReference(trip, refId).then(setItem)
  }, [trip, refId])

  return item
}
