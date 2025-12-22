import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, FilterMailIcon } from "@hugeicons/core-free-icons"
import type { DayRenderData } from "@/types.ts"
import AddItemDropdown from "@/components/buttons/AddItemDropdown.tsx"
import { Button } from "@/components/ui/button.tsx"
import Pane from "@/components/Pane.tsx"
import Itinerary from "@/components/itinerary/Itinerary.tsx"
import {
  dayIsBetween,
  formatDateMedium,
  getDaysBetween,
  isSameDay,
} from "@/lib/datetime-utils"
import {
  getArrivalDateTime,
  getDepartureDateTime,
} from "@/lib/transportation-utils"
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
      <Pane
        leftSlot={
          <Button variant="secondary" size="icon-round" disabled>
            <HugeiconsIcon icon={FilterMailIcon} />
          </Button>
        }
        title={`${formatDateMedium(trip.startDate)} - ${formatDateMedium(trip.endDate)}`}
        rightSlot={
          <AddItemDropdown
            trip={trip}
            trigger={
              <Button variant="secondary" size="icon-round">
                <HugeiconsIcon icon={Add01Icon} />
              </Button>
            }
          />
        }
        testId="itinerary-card"
      >
        <Itinerary trip={trip} dataByDays={processDataAndGroupByDays()} />
      </Pane>
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <AddItemDropdown
          trip={trip}
          trigger={
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <HugeiconsIcon icon={Add01Icon} size={24} />
            </Button>
          }
        />
      </div>
    </>
  )
}
