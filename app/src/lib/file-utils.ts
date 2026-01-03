import { useEffect, useState } from "react"
import { co } from "jazz-tools"
import type { TripEntity } from "@/repo/jazzSchema"
import type { Accommodation, Activity, Transportation } from "@/domain"
import { getDepartureDateTime, getTransportationShortName } from "@/domain"
import { useAccommodation, useActivities, useTransportation } from "@/repo"
import { useTrip } from "@/components/provider/TripProvider"

export async function addFile(trip: co.loaded<typeof TripEntity>, file: File) {
  if (trip.files.$isLoaded) {
    trip.files.$jazz.push({
      name: file.name,
      file: await co.fileStream().createFromBlob(file),
      references: [],
    })
  }
}

export type EntityType = "activity" | "accommodation" | "transportation"

export type ResolvedReference = {
  id: string
  type: EntityType
  name: string
  date: string
  transportationType?: string
}

export async function resolveReference(
  refId: string,
  activities: Array<Activity>,
  accommodation: Array<Accommodation>,
  transportation: Array<Transportation>,
): Promise<ResolvedReference | null> {
  const activity = activities.find(a => a.id === refId)
  if (activity) {
    return {
      id: refId,
      type: "activity",
      name: activity.name,
      date: activity.date,
    }
  }

  const accommodationItem = accommodation.find(a => a.id === refId)
  if (accommodationItem) {
    return {
      id: refId,
      type: "accommodation",
      name: accommodationItem.name,
      date: accommodationItem.arrivalDate,
    }
  }

  const transportationItem = transportation.find(t => t.id === refId)
  if (transportationItem) {
    const transportationType =
      transportationItem.type === "generic"
        ? transportationItem.genericType
        : transportationItem.type

    return {
      id: refId,
      type: "transportation",
      name: getTransportationShortName(transportationItem),
      date: getDepartureDateTime(transportationItem).substring(0, 10),
      transportationType,
    }
  }

  return null
}

export function useReferencedItem(refId: string): ResolvedReference | null {
  const [item, setItem] = useState<ResolvedReference | null>(null)
  const trip = useTrip()
  const { activities } = useActivities(trip.stid)
  const { accommodation } = useAccommodation(trip.stid)
  const { transportation } = useTransportation(trip.stid)

  useEffect(() => {
    let cancelled = false
    void resolveReference(
      refId,
      activities,
      accommodation,
      transportation,
    ).then(result => {
      if (!cancelled) setItem(result)
    })
    return () => {
      cancelled = true
    }
  }, [trip, refId])

  return item
}
