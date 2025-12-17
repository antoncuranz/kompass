import React from "react"
import { View, Text, SectionList, TouchableOpacity } from "react-native"
import { useCoState } from "jazz-tools/expo"
import { SharedTrip, Activity, Trip } from "../schema"
import type { co } from "jazz-tools"

interface ItineraryScreenProps {
  tripId: string
}

interface DaySection {
  title: string
  date: string
  data: Array<co.loaded<typeof Activity>>
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

function formatTime(time: string, showPeriod = true): string {
  const [hours, minutes] = time.split(":")
  const h = parseInt(hours, 10)
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  if (showPeriod) {
    return `${h12}:${minutes} ${period}`
  }
  return `${h12}:${minutes}`
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

function ActivityEntry({ activity }: { activity: co.loaded<typeof Activity> }) {
  return (
    <TouchableOpacity
      className="rounded-xl border border-dashed border-border my-2 mx-3 py-2 px-4 bg-background"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-foreground font-medium flex-1" numberOfLines={1}>
          {activity.name}
        </Text>
        {activity.time && (
          <Text className="text-muted-foreground text-sm ml-2">
            {formatTime(activity.time)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

function DayHeader({ date }: { date: string }) {
  return (
    <View className="px-3 pt-4 pb-2">
      <Text className="text-sm text-muted-foreground">{formatDate(date)}</Text>
    </View>
  )
}

export default function ItineraryScreen({ tripId }: ItineraryScreenProps) {
  const sharedTrip = useCoState(SharedTrip, tripId, {
    resolve: {
      trip: Trip.resolveQuery,
    },
  })

  if (!sharedTrip?.$isLoaded || !sharedTrip.trip?.$isLoaded) {
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

  const trip = sharedTrip.trip
  const days = getDaysBetween(trip.startDate, trip.endDate)

  const sections: Array<DaySection> = days.map(day => {
    const activitiesForDay = trip.activities.filter(act => act.date === day)
    return {
      title: formatDate(day),
      date: day,
      data: activitiesForDay,
    }
  })

  return (
    <View className="flex-1 bg-background">
      <SectionList
        sections={sections}
        keyExtractor={item => item.$jazz.id}
        renderItem={({ item }) => <ActivityEntry activity={item} />}
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
