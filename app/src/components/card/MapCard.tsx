import { useTrip } from "../provider/TripProvider"
import Card from "@/components/card/Card.tsx"
import HeroMap from "@/components/map/HeroMap.tsx"
import { isLoaded } from "@/lib/utils"

export default function MapCard({ className }: { className?: string }) {
  const trip = useTrip()

  return (
    <Card className={className}>
      <HeroMap
        activities={trip.activities.filter(isLoaded)}
        accommodation={trip.accommodation.filter(isLoaded)}
        transportation={trip.transportation.filter(isLoaded)}
      />
    </Card>
  )
}
