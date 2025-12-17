import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import type { co } from "jazz-tools"
import { SharedTrip } from "../schema"

interface TripCardProps {
  sharedTrip: co.loaded<typeof SharedTrip>
  fallbackColor: string
  onPress: () => void
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const startStr = start.toLocaleDateString("en-US", options)
  const endStr = end.toLocaleDateString("en-US", options)

  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  if (startYear !== endYear) {
    return `${startStr}, ${startYear} - ${endStr}, ${endYear}`
  }
  return `${startStr} - ${endStr}, ${endYear}`
}

export default function TripCard({
  sharedTrip,
  fallbackColor,
  onPress,
}: TripCardProps) {
  const trip = sharedTrip.trip

  return (
    <TouchableOpacity
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ backgroundColor: fallbackColor }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View className="p-5 min-h-[160px] justify-end">
        <Text className="text-white text-2xl font-bold mb-1">{trip.name}</Text>
        <Text className="text-white/80 text-base">
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
        {trip.description && (
          <Text className="text-white/70 text-sm mt-2" numberOfLines={2}>
            {trip.description}
          </Text>
        )}
        <View className="flex-row mt-3 gap-2">
          {trip.activities.length > 0 && (
            <View className="bg-white/20 px-2 py-1 rounded-full">
              <Text className="text-white text-xs">
                {trip.activities.length} activities
              </Text>
            </View>
          )}
          {trip.accommodation.length > 0 && (
            <View className="bg-white/20 px-2 py-1 rounded-full">
              <Text className="text-white text-xs">
                {trip.accommodation.length} stays
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
