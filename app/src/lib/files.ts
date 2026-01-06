import type {
  Accommodation,
  Activity,
  Transportation,
  TransportationType,
} from "@/domain"
import { getDepartureDateTime, getTransportationShortName } from "@/domain"
import { useTripEntities } from "@/hooks/useTripEntities"
import { useTrip } from "@/components/provider/TripProvider"

export function downloadBlob(blobUrl: string, fileName: string) {
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export type EntityType = "activity" | "accommodation" | "transportation"

export type ResolvedReference = {
  id: string
  type: EntityType
  name: string
  date: string
  transportationType?: TransportationType
}

export function resolveReference(
  refId: string,
  activities: Array<Activity>,
  accommodation: Array<Accommodation>,
  transportation: Array<Transportation>,
): ResolvedReference | null {
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
  const trip = useTrip()
  const { activities, accommodation, transportation } = useTripEntities(
    trip.stid,
  )

  return resolveReference(refId, activities, accommodation, transportation)
}
