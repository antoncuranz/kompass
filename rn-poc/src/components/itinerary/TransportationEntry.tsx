import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import type { co } from "jazz-tools"
import type { GenericTransportation } from "../../schema"
import { getTransportationTypeEmoji } from "../../types"

function formatTime(dateTimeStr: string): string {
  const date = new Date(dateTimeStr)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

interface TransportationEntryProps {
  transportation: co.loaded<typeof GenericTransportation>
}

export default function TransportationEntry({
  transportation,
}: TransportationEntryProps) {
  return (
    <TouchableOpacity
      className="rounded-xl border border-border mx-3 p-2 pl-4 pr-4 bg-background"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Text className="mr-2 text-2xl leading-6">
          {getTransportationTypeEmoji(transportation.genericType)}
        </Text>
        <Text className="flex-1 text-foreground" numberOfLines={1}>
          {formatTime(transportation.departureDateTime)}-
          {formatTime(transportation.arrivalDateTime)} {transportation.name}
        </Text>
      </View>
    </TouchableOpacity>
  )
}
