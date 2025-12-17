import React from "react"
import { View, Text } from "react-native"
import type { co } from "jazz-tools"
import type { Accommodation } from "../../schema"

interface DaySeparatorProps {
  accommodation: co.loaded<typeof Accommodation> | undefined
  collapsedDays: number
}

export default function DaySeparator({
  accommodation,
  collapsedDays,
}: DaySeparatorProps) {
  return (
    <>
      <Text className="mx-3 mt-2 text-sm text-muted-foreground">
        {accommodation ? (
          <>
            🛏️ {accommodation.name}
            {collapsedDays > 0 &&
              ` (${collapsedDays} ${collapsedDays !== 1 ? "days" : "day"} collapsed)`}
          </>
        ) : (
          "⚠️ missing accomodation"
        )}
      </Text>
      <View className="h-px bg-border mt-2" />
    </>
  )
}
