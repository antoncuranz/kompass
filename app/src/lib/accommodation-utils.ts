import type { DateRange } from "react-day-picker"
import type { Trip } from "@/schema.ts"
import type { co } from "jazz-tools"
import {
  addDays,
  dateFromString,
  isSameDayDate,
  subDays,
} from "@/lib/datetime-utils"
import {
  getArrivalDateTime,
  getDepartureDateTime,
} from "@/lib/transportation-utils"

type Interval = { start: Date; end: Date }

function mergeIntervals(intervals: Array<Interval>): Array<Interval> {
  if (intervals.length === 0) return []

  const sorted = [...intervals].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  )
  const merged: Array<Interval> = []
  let current = { ...sorted[0] }

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    if (next.start <= current.end) {
      if (next.end > current.end) {
        current.end = next.end
      }
    } else {
      merged.push(current)
      current = { ...next }
    }
  }

  merged.push(current)
  return merged
}

export function calculateDisabledDateRanges(
  trip: co.loaded<typeof Trip>,
  currentAccommodationId?: string,
): Array<DateRange> {
  const accommodationIntervals: Array<Interval> = trip.accommodation
    .filter(
      a => !currentAccommodationId || a.$jazz.id !== currentAccommodationId,
    )
    .map(a => ({
      start: dateFromString(a.arrivalDate),
      end: dateFromString(a.departureDate),
    }))

  const transportationIntervals: Array<Interval> = trip.transportation
    .map(t => {
      const departureDateTime = getDepartureDateTime(t as any)
      const arrivalDateTime = getArrivalDateTime(t as any)
      const departureDate = departureDateTime.substring(0, 10)
      const arrivalDate = arrivalDateTime.substring(0, 10)

      if (departureDate === arrivalDate) return null

      return {
        start: dateFromString(departureDate),
        end: dateFromString(arrivalDate),
      }
    })
    .filter(interval => interval !== null) as Array<Interval>

  const mergedIntervals = mergeIntervals([
    ...accommodationIntervals,
    ...transportationIntervals,
  ])

  const tripStartDate = dateFromString(trip.startDate)
  const tripEndDate = dateFromString(trip.endDate)

  const disabledRanges: Array<DateRange> = mergedIntervals
    .map(interval => {
      const from = isSameDayDate(interval.start, tripStartDate)
        ? interval.start
        : addDays(interval.start, 1)
      const to = isSameDayDate(interval.end, tripEndDate)
        ? interval.end
        : subDays(interval.end, 1)
      return { from, to }
    })
    .filter(range => range.from <= range.to)

  return disabledRanges
}
