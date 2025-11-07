import { createFileRoute } from "@tanstack/react-router"
import ItineraryCard from "@/components/card/ItineraryCard.tsx"
import { useTrip } from "@/components/provider/TripProvider"

export const Route = createFileRoute("/$trip/itinerary")({
  component: ItineraryPage,
})

function ItineraryPage() {
  const trip = useTrip()

  return <ItineraryCard trip={trip} />
}
