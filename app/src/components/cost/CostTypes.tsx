import type { Accommodation, Activity, Transportation, Trip } from "@/schema.ts"
import type { co } from "jazz-tools"
import { getDepartureDateTime, getTransportationName } from "@/lib/utils"
import { dateFromString, formatDateShort } from "@/components/util.ts"

type ActivityWithPrice = {
  type: "activity"
  item: co.loaded<typeof Activity>
  name: string
  date: string
  price?: number
}

type AccommodationWithPrice = {
  type: "accommodation"
  item: co.loaded<typeof Accommodation>
  name: string
  date: string
  price?: number
}

type TransportationWithPrice = {
  type: "transportation"
  item: Transportation
  name: string
  date: string
  price?: number
}

export type CostItem =
  | ActivityWithPrice
  | AccommodationWithPrice
  | TransportationWithPrice

export function createCostItems(
  trip: co.loaded<typeof Trip>,
  transportation: Array<Transportation>,
): {
  activities: Array<CostItem>
  accommodations: Array<CostItem>
  transportations: Array<CostItem>
} {
  const activities: Array<CostItem> = trip.activities.map(activity => ({
    type: "activity",
    item: activity,
    name: activity.name,
    date: formatDateShort(activity.date),
    price: activity.price,
  }))

  const accommodations: Array<CostItem> = trip.accommodation.map(acc => {
    const nights = Math.round(
      (dateFromString(acc.departureDate).getTime() -
        dateFromString(acc.arrivalDate).getTime()) /
        (1000 * 60 * 60 * 24),
    )
    return {
      type: "accommodation",
      item: acc,
      name: acc.name,
      date: `${formatDateShort(acc.arrivalDate)} (+${nights})`,
      price: acc.price,
    }
  })

  const transportations: Array<CostItem> = transportation.map(t => ({
    type: "transportation",
    item: t,
    name: getTransportationName(t),
    date: formatDateShort(getDepartureDateTime(t).split("T")[0]),
    price: t.price,
  }))

  return { activities, accommodations, transportations }
}

export function calculateTotals(
  activities: Array<CostItem>,
  accommodations: Array<CostItem>,
  transportations: Array<CostItem>,
): {
  activities: number
  accommodations: number
  transportations: number
  grandTotal: number
} {
  const sum = (items: Array<CostItem>) =>
    items.reduce((s, i) => s + (i.price ?? 0), 0)
  const activitiesTotal = sum(activities)
  const accommodationsTotal = sum(accommodations)
  const transportationsTotal = sum(transportations)

  return {
    activities: activitiesTotal,
    accommodations: accommodationsTotal,
    transportations: transportationsTotal,
    grandTotal: activitiesTotal + accommodationsTotal + transportationsTotal,
  }
}

export function sortCostItems(items: Array<CostItem>): Array<CostItem> {
  return items.sort((a, b) => {
    if (a.type === "activity" && b.type === "activity") {
      return a.date.localeCompare(b.date)
    } else if (a.type === "accommodation" && b.type === "accommodation") {
      return a.item.arrivalDate.localeCompare(b.item.arrivalDate)
    } else if (a.type === "transportation" && b.type === "transportation") {
      return getDepartureDateTime(a.item).localeCompare(
        getDepartureDateTime(b.item),
      )
    }
    return 0
  })
}
