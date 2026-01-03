import { Layer, Source } from "react-map-gl/maplibre"
import type { Feature, FeatureCollection } from "geojson"
import type { Activity } from "@/domain"
import { formatDateShort, formatTime } from "@/lib/datetime-utils"
import { useTrip } from "@/components/provider/TripProvider"
import { useActivityRepo } from "@/repo"

export default function ActivityLayer() {
  const trip = useTrip()
  const { activities } = useActivityRepo(trip.stid)

  function getActivityGeoJson(): FeatureCollection {
    const features = activities
      .filter(activity => activity.location)
      .map(mapActivityToFeature)

    return { type: "FeatureCollection", features: features }
  }

  function mapActivityToFeature(activity: Activity): Feature {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          activity.location!.longitude,
          activity.location!.latitude,
        ],
      },
      properties: {
        type: "ACTIVITY",
        popupTitle: activity.name,
        popupBody:
          formatDateShort(activity.date) +
          (activity.time ? " " + formatTime(activity.time) : ""),
      },
    }
  }

  return (
    <Source type="geojson" data={getActivityGeoJson()}>
      <Layer
        id="activity"
        type="circle"
        paint={{
          "circle-color": "#59B900",
          "circle-radius": 5,
          "circle-stroke-color": "white",
          "circle-stroke-width": 3,
        }}
      />
    </Source>
  )
}
