import type { DateRange } from "react-day-picker"
import type { Trip } from "@/domain"
import { getArrivalDateTime, getDepartureDateTime } from "@/domain"
import { addDays, dateFromString, isSameDayDate, subDays } from "@/lib/datetime"
import {
  useAccommodationSubscription,
  useTransportationSubscription,
} from "@/repo"

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
  trip: Trip,
  currentAccommodationId?: string,
): Array<DateRange> {
  const { accommodation } = useAccommodationSubscription(trip.stid)
  const { transportation } = useTransportationSubscription(trip.stid)

  const accommodationIntervals: Array<Interval> = accommodation
    .filter(a => !currentAccommodationId || a.id !== currentAccommodationId)
    .map(a => ({
      start: dateFromString(a.arrivalDate),
      end: dateFromString(a.departureDate),
    }))

  const transportationIntervals: Array<Interval> = transportation
    .map(t => {
      const departureDateTime = getDepartureDateTime(t)
      const arrivalDateTime = getArrivalDateTime(t)
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
