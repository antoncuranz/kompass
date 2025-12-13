import { useTrip } from "../provider/TripProvider"
import Pane from "@/components/Pane.tsx"
import HeroMap from "@/components/map/HeroMap.tsx"
import { cn } from "@/lib/utils"
import { isLoaded } from "@/lib/misc-utils"

export default function MapPane({ className }: { className?: string }) {
  const trip = useTrip()

  return (
    <Pane className={cn("sm:p-0", className)}>
      <HeroMap
        activities={trip.activities.filter(isLoaded)}
        accommodation={trip.accommodation.filter(isLoaded)}
        transportation={trip.transportation.filter(isLoaded)}
      />
    </Pane>
  )
}
