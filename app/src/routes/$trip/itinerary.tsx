import { createFileRoute } from "@tanstack/react-router"
import { PlaneTakeoff, Plus } from "lucide-react"
import type { DayRenderData } from "@/types.ts"
import AddSomethingDropdown from "@/components/buttons/AddSomethingDropdown.tsx"
import { Button } from "@/components/ui/button.tsx"
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

      const relevantTransportation = transportation.filter(
        t => dayIsBetween(day, getDepartureDateTime(t), getArrivalDateTime(t)), // TODO: this causes errors sometimes
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
    <>
      <Card
        title="Trip Itinerary"
        headerSlot={
          <AddSomethingDropdown
            trip={trip}
            trigger={
              <Button size="sm" className="h-8 gap-1 mt-0 ml-1 self-end">
                <PlaneTakeoff className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Entry
                </span>
              </Button>
            }
          />
        }
        testId="itinerary-card"
      >
        <Itinerary trip={trip} dataByDays={processDataAndGroupByDays()} />
      </Card>
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <AddSomethingDropdown
          trip={trip}
          trigger={
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <Plus className="size-6" />
            </Button>
          }
        />
      </div>
    </>
  )
}
