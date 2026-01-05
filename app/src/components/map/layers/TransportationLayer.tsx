import { Layer, Source } from "react-map-gl/maplibre"
import type { FeatureCollection } from "geojson"
import type { Transportation, TransportationType } from "@/domain"
import { useTransportationSubscription } from "@/repo"
import { useTrip } from "@/components/provider/TripProvider"

export default function TransportationLayer() {
  const trip = useTrip()
  const { transportation } = useTransportationSubscription(trip.stid)

  function getTransportationType(t: Transportation): TransportationType {
    if (t.type === "generic") {
      return t.genericType
    }
    return t.type
  }

  function getColorByType(t: Transportation): string {
    switch (getTransportationType(t)) {
      case "flight":
        return "#007cbf"
      case "train":
        return "#ec0016"
      case "ferry":
      case "boat":
        return "#01428c"
      default:
        return "purple"
    }
  }

  function typeRank(type: TransportationType): number {
    switch (type) {
      case "flight":
        return 4
      case "train":
        return 3
      case "ferry":
      case "boat":
        return 2
      case "bus":
      case "car":
        return 1
      default:
        return 0
    }
  }

  function sortByTransportationType(
    a: Transportation,
    b: Transportation,
  ): number {
    return (
      typeRank(getTransportationType(a)) - typeRank(getTransportationType(b))
    )
  }

  const transportationWithGeoJson = transportation
    .filter(t => t.geoJson !== undefined)
    .sort(sortByTransportationType)
    .map(t => ({
      transportation: t,
      geoJson: t.geoJson as FeatureCollection, // TODO
    }))

  return (
    <>
      {transportationWithGeoJson.map(({ transportation, geoJson }, idx) => (
        <Source key={idx} type="geojson" data={geoJson}>
          <Layer
            type="line"
            paint={{
              "line-color": getColorByType(transportation),
              "line-width": 5,
            }}
            layout={{ "line-cap": "round" }}
          />
          <Layer
            type="circle"
            id={"geojson" + idx}
            filter={["==", ["geometry-type"], "Point"]}
            paint={{
              "circle-color": getColorByType(transportation),
              "circle-radius": 5,
              "circle-stroke-color": "white",
              "circle-stroke-width": 3,
            }}
          />
        </Source>
      ))}
    </>
  )
}
