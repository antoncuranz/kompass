"use client"

import Card from "@/components/card/Card.tsx"
import SkeletonCard from "@/components/card/SkeletonCard.tsx"
import HeroMap from "@/components/map/HeroMap.tsx"
import { RESOLVE_SHARED_TRIP, SharedTrip } from "@/schema.ts"
import { useCoStateWithSelector } from "jazz-tools/react-core"

export default function MapCard({
  tripId,
  className,
}: {
  tripId: string
  className?: string
}) {
  const trip = useCoStateWithSelector(SharedTrip, tripId, {
    resolve: RESOLVE_SHARED_TRIP,
    select: sharedTrip => sharedTrip?.trip,
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
