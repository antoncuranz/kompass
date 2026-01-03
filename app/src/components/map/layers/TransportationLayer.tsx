import { Layer, Source } from "react-map-gl/maplibre"
import type { FeatureCollection } from "geojson"
import { TransportationType } from "@/types"
import type { Transportation } from "@/domain"
import { useTransportation } from "@/repo"
import { useTrip } from "@/components/provider/TripProvider"

export default function TransportationLayer() {
  const trip = useTrip()
  const { transportation } = useTransportation(trip.stid)

  function getTransportationType(t: Transportation): TransportationType {
    if (t.type === "generic") {
      return t.genericType.toUpperCase() as TransportationType
    }
    return t.type.toUpperCase() as TransportationType
  }

  function getColorByType(t: Transportation): string {
    switch (getTransportationType(t)) {
      case TransportationType.Flight:
        return "#007cbf"
      case TransportationType.Train:
        return "#ec0016"
      case TransportationType.Ferry:
      case TransportationType.Boat:
        return "#01428c"
      default:
        return "purple"
    }
  }

  function typeRank(type: TransportationType): number {
    switch (type) {
      case TransportationType.Flight:
        return 4
      case TransportationType.Train:
        return 3
      case TransportationType.Ferry:
      case TransportationType.Boat:
        return 2
      case TransportationType.Bus:
      case TransportationType.Car:
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
      geoJson: t.geoJson as FeatureCollection,
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
