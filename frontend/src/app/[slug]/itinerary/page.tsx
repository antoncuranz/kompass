import ItineraryCard from "@/components/card/ItineraryCard.tsx"
import MapCard from "@/components/card/MapCard.tsx"
import { MapProvider } from "@/components/provider/MapProvider.tsx"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const tripId = (await params).slug

  const itineraryClasses = "lg:max-w-3xl lg:min-w-152"
  const mapClasses = "hidden lg:block"

  return (
    <div className="flex h-full gap-4">
      <MapProvider>
        <ItineraryCard tripId={tripId} className={itineraryClasses} />
        <MapCard tripId={tripId} className={mapClasses} />
      </MapProvider>
    </div>
  )
}
