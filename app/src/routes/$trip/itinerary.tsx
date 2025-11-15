import { createFileRoute } from "@tanstack/react-router"
import type { DayRenderData } from "@/types.ts"
import AddSomethingDropdown from "@/components/buttons/AddSomethingDropdown.tsx"
import Card from "@/components/card/Card.tsx"
import Itinerary from "@/components/itinerary/Itinerary.tsx"
import { dayIsBetween, getDaysBetween, isSameDay } from "@/components/util.ts"
import { getArrivalDateTime, getDepartureDateTime } from "@/lib/utils"
import { useTransportation, useTrip } from "@/components/provider/TripProvider"

export const Route = createFileRoute("/$trip/itinerary")({
  component: ItineraryPage,
})

function ItineraryPage() {
  const trip = useTrip()
  const transportation = useTransportation()

  function processDataAndGroupByDays() {
    const grouped: Array<DayRenderData> = []

    for (const day of getDaysBetween(trip.startDate, trip.endDate)) {
      const filteredActivities = trip.activities.filter(act =>
        isSameDay(day, act.date),
      )

      const relevantTransportation = transportation.filter(t =>
        dayIsBetween(day, getDepartureDateTime(t), getArrivalDateTime(t)),
      )

      const relevantAccommodation = trip.accommodation.find(
        acc => acc.arrivalDate <= day && acc.departureDate > day,
      )

      // TODO: also push if day is today!
      if (
        isSameDay(day, trip.endDate) ||
        grouped.length == 0 ||
        relevantTransportation.length != 0 ||
        filteredActivities.length != 0 ||
        relevantAccommodation != grouped[grouped.length - 1].accommodation ||
        grouped[grouped.length - 1].transportation.find(t =>
          isSameDay(getArrivalDateTime(t), day),
        )
      ) {
        grouped.push({
          day: day,
          transportation: relevantTransportation,
          activities: filteredActivities,
          accommodation: relevantAccommodation,
        })
      }
    }

    return grouped
  }

  return (
    <Card
      title="Trip Itinerary"
      headerSlot={<AddSomethingDropdown trip={trip} />}
      testId="itinerary-card"
    >
      <Itinerary trip={trip} dataByDays={processDataAndGroupByDays()} />
    </Card>
  )
}
