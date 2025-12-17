import React, { useEffect, useState } from "react"
import { View, Text, SectionList, TouchableOpacity } from "react-native"
import { useCoState } from "jazz-tools/expo"
import type { co } from "jazz-tools"
import {
  SharedTrip,
  Activity,
  Trip,
  Accommodation,
  Flight,
  FlightLeg,
  Train,
  GenericTransportation,
  type Transportation,
} from "../schema"
import {
  loadTransportation,
  getDepartureDateTime,
  getArrivalDateTime,
} from "../lib/transportation-utils"
import { DayRenderData } from "../types"
import FlightEntry from "../components/itinerary/FlightEntry"
import TrainEntry from "../components/itinerary/TrainEntry"
import TransportationEntry from "../components/itinerary/TransportationEntry"
import DaySeparator from "../components/itinerary/DaySeparator"

interface ItineraryScreenProps {
  tripId: string
}

interface DaySection {
  title: string
  date: string
  data: Array<DayRenderData>
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const h = parseInt(hours, 10)
  return `${h}:${minutes}`
}

function formatDuration(startDateTime: string, endDateTime: string): string {
  const start = new Date(startDateTime)
  const end = new Date(endDateTime)
  const diffMs = end.getTime() - start.getTime()
  const diffMins = Math.round(diffMs / 60000)
  const h = Math.floor(diffMins / 60)
  const m = diffMins % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function getDaysBetween(startDate: string, endDate: string): Array<string> {
  const days: Array<string> = []
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")

  const current = new Date(start)
  while (current <= end) {
    days.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }

  return days
}

function isSameDay(day: string, dateTime: string): boolean {
  return dateTime.startsWith(day)
}

function dayIsBetween(
  day: string,
  startDateTime: string,
  endDateTime: string,
): boolean {
  const dayStart = day + "T00:00:00"
  const dayEnd = day + "T23:59:59"
  return startDateTime <= dayEnd && endDateTime >= dayStart
}

function ActivityEntry({ activity }: { activity: co.loaded<typeof Activity> }) {
  return (
    <TouchableOpacity
      className="rounded-xl border border-dashed border-border mx-3 py-2 px-4 bg-background"
      activeOpacity={0.7}
    >
      <Text className="text-foreground">
        {activity.name}
        {activity.time && (
          <Text className="text-muted-foreground">
            {" "}
            {formatTime(activity.time)}
          </Text>
        )}
      </Text>
    </TouchableOpacity>
  )
}

function DayHeader({ date }: { date: string }) {
  return (
    <View className="mx-3 pt-2 pb-2">
      <Text className="text-sm text-muted-foreground">{formatDate(date)}</Text>
    </View>
  )
}

function useTransportation(
  trip: co.loaded<typeof Trip> | undefined,
): Array<Transportation> {
  const [loaded, setLoaded] = useState<Array<Transportation>>([])

  useEffect(() => {
    if (!trip) {
      setLoaded([])
      return
    }

    let cancelled = false

    async function loadAll() {
      const result = await Promise.all(
        trip!.transportation.map(async t => {
          const typed = t as
            | co.loaded<typeof Flight>
            | co.loaded<typeof Train>
            | co.loaded<typeof GenericTransportation>
          return await loadTransportation(typed)
        }),
      )
      if (!cancelled) {
        setLoaded(result)
      }
    }

    void loadAll()

    return () => {
      cancelled = true
    }
  }, [trip?.transportation])

  return loaded
}

export default function ItineraryScreen({ tripId }: ItineraryScreenProps) {
  const sharedTrip = useCoState(SharedTrip, tripId, {
    resolve: {
      trip: Trip.resolveQuery,
    },
  })

  const trip =
    sharedTrip?.$isLoaded && sharedTrip.trip?.$isLoaded
      ? sharedTrip.trip
      : undefined
  const transportation = useTransportation(trip)

  if (!trip) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">
            Loading itinerary...
          </Text>
        </View>
      </View>
    )
  }

  function processDataAndGroupByDays(): Array<DayRenderData> {
    const grouped: Array<DayRenderData> = []

    for (const day of getDaysBetween(trip!.startDate, trip!.endDate)) {
      const filteredActivities = trip!.activities.filter(act =>
        isSameDay(day, act.date),
      )

      const relevantTransportation = transportation.filter(t =>
        dayIsBetween(day, getDepartureDateTime(t), getArrivalDateTime(t)),
      )

      const relevantAccommodation = trip!.accommodation.find(
        acc => acc.arrivalDate <= day && acc.departureDate > day,
      )

      // Push day if it has content or is first/last day
      if (
        isSameDay(day, trip!.endDate) ||
        grouped.length === 0 ||
        relevantTransportation.length !== 0 ||
        filteredActivities.length !== 0 ||
        relevantAccommodation !== grouped[grouped.length - 1]?.accommodation ||
        grouped[grouped.length - 1]?.transportation.find(t =>
          isSameDay(day, getArrivalDateTime(t)),
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

  const dataByDays = processDataAndGroupByDays()

  function renderTransportation(t: Transportation, dayData: DayRenderData) {
    switch (t.type) {
      case "flight":
        return renderFlight(t, dayData)
      case "train":
        return renderTrain(t, dayData)
      case "generic":
        if (isSameDay(dayData.day, t.departureDateTime)) {
          return <TransportationEntry transportation={t} />
        }
        return null
    }
  }

  function renderFlight(
    flight: co.loaded<typeof Flight>,
    dayData: DayRenderData,
  ) {
    const filteredLegs = flight.legs.filter(leg =>
      isSameDay(dayData.day, leg.departureDateTime),
    )

    return filteredLegs.map((leg, idx) => (
      <View key={`flight-${flight.$jazz.id}-${idx}`}>
        <FlightEntry flight={flight} flightLeg={leg} />
        {filteredLegs.length > idx + 1 && (
          <Text className="mx-3 text-sm text-muted-foreground mt-1">
            {formatDuration(
              leg.arrivalDateTime,
              filteredLegs[idx + 1].departureDateTime,
            )}{" "}
            Layover
          </Text>
        )}
      </View>
    ))
  }

  function renderTrain(train: co.loaded<typeof Train>, dayData: DayRenderData) {
    const filteredLegs = train.legs.filter(leg =>
      isSameDay(dayData.day, leg.departureDateTime),
    )

    return filteredLegs.map((leg, idx) => (
      <View key={`train-${train.$jazz.id}-${idx}`}>
        <TrainEntry trainLeg={leg} />
        {filteredLegs.length > idx + 1 && (
          <Text className="mx-3 text-sm text-muted-foreground mt-1">
            {formatDuration(
              leg.arrivalDateTime,
              filteredLegs[idx + 1].departureDateTime,
            )}{" "}
            Layover
          </Text>
        )}
      </View>
    ))
  }

  function getCollapsedDays(currentIdx: number): number {
    if (currentIdx >= dataByDays.length - 1) return 0
    const currentDay = new Date(dataByDays[currentIdx].day + "T00:00:00")
    const nextDay = new Date(dataByDays[currentIdx + 1].day + "T00:00:00")
    const diffTime = nextDay.getTime() - currentDay.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return diffDays - 1
  }

  function hasOvernightTransportation(dayData: DayRenderData): boolean {
    return dayData.transportation.some(t => {
      switch (t.type) {
        case "flight":
          return t.legs.some(
            leg =>
              isSameDay(dayData.day, leg.departureDateTime) &&
              !isSameDay(dayData.day, leg.arrivalDateTime),
          )
        case "train":
          return t.legs.some(
            leg =>
              isSameDay(dayData.day, leg.departureDateTime) &&
              !isSameDay(dayData.day, leg.arrivalDateTime),
          )
        case "generic":
          return !isSameDay(dayData.day, t.arrivalDateTime)
      }
    })
  }

  // Transform to sections format
  const sections: Array<DaySection> = dataByDays.map((dayData, idx) => ({
    title: formatDate(dayData.day),
    date: dayData.day,
    data: [dayData],
  }))

  return (
    <View className="flex-1 bg-background">
      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => `day-${item.day}-${idx}`}
        renderItem={({ item: dayData, index, section }) => {
          const dayIdx = dataByDays.findIndex(d => d.day === dayData.day)
          const collapsedDays = getCollapsedDays(dayIdx)
          const hasOvernight = hasOvernightTransportation(dayData)
          const isLastDay = dayIdx === dataByDays.length - 1

          return (
            <View>
              {/* Activities */}
              {dayData.activities.map(act => (
                <ActivityEntry key={act.$jazz.id} activity={act} />
              ))}

              {/* Transportation */}
              {dayData.transportation.map((t, idx) => (
                <View key={`transport-${t.$jazz.id}-${idx}`} className="mt-4">
                  {renderTransportation(t, dayData)}
                </View>
              ))}

              {/* Day Separator */}
              {!isLastDay &&
                (hasOvernight ? (
                  <View className="h-px bg-border mt-4 relative -mb-5" />
                ) : (
                  <DaySeparator
                    accommodation={dayData.accommodation}
                    collapsedDays={collapsedDays}
                  />
                ))}
            </View>
          )
        }}
        renderSectionHeader={({ section }) => <DayHeader date={section.date} />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-5xl mb-4">📅</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">
              No activities yet
            </Text>
            <Text className="text-muted-foreground text-center px-8">
              Add activities on the web app to see them here!
            </Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  )
}
