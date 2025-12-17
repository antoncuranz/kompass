import React, { useState } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import type { co } from "jazz-tools"
import type { TrainLeg } from "../../schema"

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

interface TrainEntryProps {
  trainLeg: co.loaded<typeof TrainLeg>
}

export default function TrainEntry({ trainLeg }: TrainEntryProps) {
  const [open, setOpen] = useState(false)

  return (
    <TouchableOpacity
      className="rounded-xl border border-border mx-3 p-2 pl-4 pr-4 bg-background"
      activeOpacity={0.7}
      onPress={() => setOpen(!open)}
    >
      {/* Collapsed/Expanded Header */}
      <View className="flex-row items-center">
        <Text className="mr-2 text-2xl leading-6">🚇</Text>
        <Text className="flex-1 text-foreground" numberOfLines={1}>
          {open
            ? `Train from ${trainLeg.origin.name} to ${trainLeg.destination.name}`
            : `${formatTime(trainLeg.departureDateTime)}-${formatTime(trainLeg.arrivalDateTime)} ${trainLeg.lineName} from ${trainLeg.origin.name} to ${trainLeg.destination.name}`}
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
                {formatTime(trainLeg.departureDateTime)} {trainLeg.origin.name}
              </Text>
              <Text className="text-sm text-muted-foreground">
                Duration: {formatDurationMinutes(trainLeg.durationInMinutes)}
              </Text>
              <Text className="text-foreground" numberOfLines={1}>
                {formatTime(trainLeg.arrivalDateTime)}{" "}
                {trainLeg.destination.name}
              </Text>
            </View>
          </View>

          {/* Operator info */}
          <Text
            className="text-sm text-muted-foreground mt-2"
            numberOfLines={1}
          >
            {trainLeg.operatorName} - {trainLeg.lineName}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
