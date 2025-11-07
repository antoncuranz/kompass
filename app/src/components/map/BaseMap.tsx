import React from "react"
import { Map as MapboxMap } from "react-map-gl/mapbox"
import { Map as MaplibreMap } from "react-map-gl/maplibre"
import type { MapProps } from "@/components/map/common.tsx"
import type { Coordinates } from "@/types.ts"
import { isMapbox, mapStyle, mapboxToken } from "@/components/map/common.tsx"
import RenderAfterMap from "@/components/map/RenderAfterMap.tsx"

// TODO: make dynamic:
import "mapbox-gl/dist/mapbox-gl.css"
import "maplibre-gl/dist/maplibre-gl.css"

export default function BaseMap({
  children,
  initialCoordinates,
  ...props
}: MapProps & {
  children: React.ReactNode | Array<React.ReactNode>
  initialCoordinates?: Coordinates | undefined
}) {
  function getMapboxTheme() {
    return "day"
  }

  const commonOptions = {
    initialViewState: {
      latitude: initialCoordinates?.latitude ?? 52.520007,
      longitude: initialCoordinates?.longitude ?? 13.404954,
      zoom: 10,
    },
    style: { background: "#04162a" },
  }

  return isMapbox ? (
    <MapboxMap
      mapboxAccessToken={mapboxToken}
      mapStyle={mapStyle ?? "mapbox://styles/mapbox/standard"}
      config={{ basemap: { lightPreset: getMapboxTheme() } }}
      projection="globe"
      {...commonOptions}
      {...props}
    >
      <RenderAfterMap theme={getMapboxTheme()}>{children}</RenderAfterMap>
    </MapboxMap>
  ) : (
    <MaplibreMap
      mapStyle={
        mapStyle ?? "https://antoncuranz.github.io/basemaps-assets/streets.json"
      }
      projection="globe"
      workerCount={2}
      maxParallelImageRequests={32}
      {...commonOptions}
      {...props}
    >
      <RenderAfterMap>{children}</RenderAfterMap>
    </MaplibreMap>
  )
}
