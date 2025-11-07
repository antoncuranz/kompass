import { Layer, Source } from "react-map-gl/maplibre"
import type { FeatureCollection } from "geojson"
import type { co } from "jazz-tools"
import type { Transportation } from "@/schema"
import { useTransportation } from "@/components/provider/TripProvider"
import { TransportationType } from "@/types"

export default function TransportationLayer() {
  const transportation = useTransportation()

  function getTransportationType(
    t: co.loaded<typeof Transportation>,
  ): TransportationType {
    if (t.type === "generic") {
      return t.genericType.toUpperCase() as TransportationType
    }
    return t.type.toUpperCase() as TransportationType
  }

  function getColorByType(t: co.loaded<typeof Transportation>): string {
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
    a: co.loaded<typeof Transportation>,
    b: co.loaded<typeof Transportation>,
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
