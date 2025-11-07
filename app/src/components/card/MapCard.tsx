import { useTrip } from "../provider/TripProvider"
import Card from "@/components/card/Card.tsx"
import HeroMap from "@/components/map/HeroMap.tsx"

export default function MapCard({ className }: { className?: string }) {
  const trip = useTrip()
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
