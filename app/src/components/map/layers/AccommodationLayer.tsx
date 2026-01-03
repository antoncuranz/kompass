import { Layer, Source } from "react-map-gl/maplibre"
import type { Feature, FeatureCollection } from "geojson"
import { formatDateShort } from "@/lib/datetime-utils"
import { useTrip } from "@/components/provider/TripProvider"
import { useAccommodation } from "@/repo"
import type { Accommodation } from "@/domain"

export default function AccommodationLayer() {
  const trip = useTrip()
  const { accommodation } = useAccommodation(trip.stid)

  function getAccommodationGeoJson(): FeatureCollection {
    const features = accommodation
      .filter(activity => activity.location)
      .map(mapAccommodationToFeature)

    return { type: "FeatureCollection", features: features }
  }

  function mapAccommodationToFeature(accommodation: Accommodation): Feature {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          accommodation.location!.longitude,
          accommodation.location!.latitude,
        ],
      },
      properties: {
        type: "ACCOMMODATION",
        popupTitle: `🛏️ ${accommodation.name}`,
        popupBody: `${formatDateShort(accommodation.arrivalDate)}-${formatDateShort(accommodation.departureDate)}`,
      },
    }
  }

  return (
    <Source type="geojson" data={getAccommodationGeoJson()}>
      <Layer
        id="accommodation"
        type="circle"
        paint={{
          "circle-color": "#f4b682",
          "circle-radius": 5,
          "circle-stroke-color": "white",
          "circle-stroke-width": 3,
        }}
      />
    </Source>
  )
}
