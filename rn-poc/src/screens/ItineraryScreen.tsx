import React from "react"
import { View, Text, SectionList, SafeAreaView } from "react-native"
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
  })
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

function ActivityCard({ activity }: { activity: co.loaded<typeof Activity> }) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-border">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">
            {activity.name}
          </Text>
          {activity.time && (
            <Text className="text-sm text-muted-foreground mt-1">
              ⏰ {activity.time}
            </Text>
          )}
          {activity.address && (
            <Text
              className="text-sm text-muted-foreground mt-1"
              numberOfLines={2}
            >
              📍 {activity.address}
            </Text>
          )}
          {activity.description && (
            <Text
              className="text-sm text-muted-foreground mt-2"
              numberOfLines={3}
            >
              {activity.description}
            </Text>
          )}
        </View>
        {activity.price !== undefined && activity.price > 0 && (
          <View className="bg-primary/10 px-2 py-1 rounded-lg ml-2">
            <Text className="text-primary font-semibold">
              ${activity.price}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

function DayHeader({ title, date }: { title: string; date: string }) {
  return (
    <View className="bg-muted px-4 py-3 mb-3">
      <Text className="text-lg font-bold text-foreground">{title}</Text>
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
      <SafeAreaView className="flex-1 bg-muted">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">
            Loading itinerary...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const trip = sharedTrip.trip
  const days = getDaysBetween(trip.startDate, trip.endDate)

  const sections: Array<DaySection> = days.map((day, index) => {
    const activitiesForDay = trip.activities.filter(act => act.date === day)
    return {
      title: `Day ${index + 1}`,
      date: day,
      data: activitiesForDay,
    }
  })

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <SectionList
        sections={sections}
        keyExtractor={item => item.$jazz.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <ActivityCard activity={item} />
          </View>
        )}
        renderSectionHeader={({ section }) => (
          <DayHeader title={section.title} date={section.date} />
        )}
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
        ListHeaderComponent={() => (
          <View className="p-4 pb-0">
            <Text className="text-2xl font-bold text-foreground mb-2">
              {trip.name}
            </Text>
            <Text className="text-muted-foreground mb-4">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  )
}
