import React, { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import type { co } from "jazz-tools"
import type { Flight, FlightLeg } from "../../schema"

function formatTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

interface FlightEntryProps {
  flight: co.loaded<typeof Flight>
  flightLeg: co.loaded<typeof FlightLeg>
}

export default function FlightEntry({ flight, flightLeg }: FlightEntryProps) {
  const [open, setOpen] = useState(false)

  return (
    <TouchableOpacity
      className="rounded-xl border border-border mx-3 p-2 pl-4 pr-4 bg-background"
      activeOpacity={0.7}
      onPress={() => setOpen(!open)}
    >
      {/* Collapsed/Expanded Header */}
      <View className="flex-row items-center">
        <Text className="mr-2">✈️</Text>
        <Text className="flex-1 text-foreground" numberOfLines={1}>
          {open
            ? `Flight from ${flightLeg.origin.municipality} to ${flightLeg.destination.municipality}`
            : `${formatTime(flightLeg.departureDateTime)}-${formatTime(flightLeg.arrivalDateTime)} Flight ${flightLeg.flightNumber} from ${flightLeg.origin.municipality} to ${flightLeg.destination.municipality}`}
        </Text>
        <Text className="text-muted-foreground ml-1">{open ? "▲" : "▼"}</Text>
      </View>

      {/* Expanded Content */}
      {open && (
        <View className="mt-2">
          <View className="flex-row">
            {/* Timeline dots */}
            <View className="items-center mr-2 mt-1">
              <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <View className="h-10 w-0.5 bg-gray-300" />
              <View className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </View>

            {/* Details */}
            <View className="flex-1">
              <Text className="text-foreground" numberOfLines={1}>
                {formatTime(flightLeg.departureDateTime)}{" "}
                {flightLeg.origin.name} ({flightLeg.origin.iata})
              </Text>
              <Text className="text-sm text-muted-foreground">
                Duration: {formatDurationMinutes(flightLeg.durationInMinutes)}
              </Text>
              <Text className="text-foreground" numberOfLines={1}>
                {formatTime(flightLeg.arrivalDateTime)}{" "}
                {flightLeg.destination.name} ({flightLeg.destination.iata})
              </Text>
            </View>
          </View>

          {/* Airline info */}
          <Text
            className="text-sm text-muted-foreground mt-2"
            numberOfLines={1}
          >
            {flightLeg.airline} - {flightLeg.flightNumber}
            {flightLeg.aircraft ? ` - ${flightLeg.aircraft}` : ""}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
