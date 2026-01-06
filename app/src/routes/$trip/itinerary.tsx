import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, FilterMailIcon } from "@hugeicons/core-free-icons"
import type { DayRenderData } from "@/components/itinerary/types"
import AddEntryDropdown from "@/components/buttons/AddEntryDropdown.tsx"
import { Button } from "@/components/ui/button.tsx"
import Pane from "@/components/Pane.tsx"
import Itinerary from "@/components/itinerary/Itinerary.tsx"
import { dayIsBetween, getDaysBetween, isSameDay } from "@/lib/datetime"
import { formatDateMedium } from "@/lib/formatting"
import { useTripEntities } from "@/hooks/useTripEntities"
import { useTrip } from "@/components/provider/TripProvider"
import { getArrivalDateTime, getDepartureDateTime } from "@/domain"

export const Route = createFileRoute("/$trip/itinerary")({
  component: ItineraryPage,
})

function ItineraryPage() {
  const trip = useTrip()
  const { activities, accommodation, transportation } = useTripEntities(
    trip.stid,
  )

  function processDataAndGroupByDays() {
    const grouped: Array<DayRenderData> = []

    for (const day of getDaysBetween(trip.startDate, trip.endDate)) {
      const filteredActivities = activities.filter(act =>
        isSameDay(day, act.date),
      )

      const relevantTransportation = transportation.filter(t =>
        dayIsBetween(day, getDepartureDateTime(t), getArrivalDateTime(t)),
      )

      const relevantAccommodation = accommodation.find(
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
          <AddEntryDropdown
            trigger={
              <Button
                variant="secondary"
                size="icon-round"
                aria-label="Add Entry"
              >
                <HugeiconsIcon icon={Add01Icon} />
              </Button>
            }
          />
        }
        testId="itinerary-card"
      >
        <Itinerary dataByDays={processDataAndGroupByDays()} />
      </Pane>
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <AddEntryDropdown
          trigger={
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <HugeiconsIcon icon={Add01Icon} size={24} />
            </Button>
          }
          aria-label="Add Entry"
        />
      </div>
    </>
  )
}
