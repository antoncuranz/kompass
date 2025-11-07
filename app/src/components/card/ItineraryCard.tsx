import { useCallback, useEffect, useState } from "react"
import type { Transportation, Trip } from "@/schema.ts"
import type { DayRenderData } from "@/types.ts"
import type { co } from "jazz-tools"
import AddSomethingDropdown from "@/components/buttons/AddSomethingDropdown.tsx"
import Card from "@/components/card/Card.tsx"
import Itinerary from "@/components/itinerary/Itinerary.tsx"
import { dayIsBetween, getDaysBetween, isSameDay } from "@/components/util.ts"
import { loadTransportation } from "@/schema.ts"

export default function ItineraryCard({
  trip,
  className,
}: {
  trip: co.loaded<typeof Trip>
  className?: string
}) {
  const [dataByDays, setDataByDays] = useState<Array<DayRenderData>>([])

  function getDepartureDateTime(transportation: Transportation): string {
    switch (transportation.type) {
      case "flight":
        return transportation.legs[0].departureDateTime

      case "train":
        return transportation.legs[0].departureDateTime

      case "generic":
        return transportation.departureDateTime
    }
  }

  function getArrivalDateTime(transportation: Transportation): string {
    switch (transportation.type) {
      case "flight":
        return transportation.legs[0].arrivalDateTime

      case "train":
        return transportation.legs[0].arrivalDateTime

      case "generic":
        return transportation.arrivalDateTime
    }
  }

  const processDataAndGroupByDays = useCallback(
    (transportation: Array<Transportation>) => {
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

      setDataByDays(grouped)
    },
    [trip],
  )

  useEffect(() => {
    async function loadAndProcessData() {
      const loaded = await Promise.all(
        trip.transportation.map(async t => await loadTransportation(t)),
      )

      processDataAndGroupByDays(loaded)
    }

    loadAndProcessData()
  }, [trip, processDataAndGroupByDays])

  return (
    <Card
      title="Trip Itinerary"
      headerSlot={<AddSomethingDropdown trip={trip} />}
      className={className}
    >
      <Itinerary trip={trip} dataByDays={dataByDays} />
    </Card>
  )
}
