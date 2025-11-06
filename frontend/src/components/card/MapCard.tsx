"use client"

import Card from "@/components/card/Card.tsx"
import SkeletonCard from "@/components/card/SkeletonCard.tsx"
import HeroMap from "@/components/map/HeroMap.tsx"
import { Trip } from "@/schema.ts"
import { useCoState } from "jazz-tools/react"

export default function MapCard({
  tripId,
  className,
}: {
  tripId: string
  className?: string
}) {
  // TODO: tripId is still sharedTripId!
  const trip = useCoState(Trip, tripId, {
    resolve: { activities: true, accommodation: true, transportation: true },
  })

  if (!trip) {
    return (
      <SkeletonCard
        className={className}
        title={trip === null ? "Error loading Map" : undefined}
      />
    )
  }

  return (
    <Card className={className}>
      <HeroMap
        activities={trip.activities.filter(act => act !== null)}
        accommodation={trip.accommodation.filter(acc => acc !== null)}
        transportation={trip.transportation.filter(t => t !== null)}
      />
    </Card>
  )
}
