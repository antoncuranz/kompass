import React from "react"
import { Map as MaplibreMap } from "react-map-gl/maplibre"
import type { MapProps } from "react-map-gl/maplibre"
import type { Coordinates } from "@/types.ts"
import RenderAfterMap from "@/components/map/RenderAfterMap.tsx"
import "maplibre-gl/dist/maplibre-gl.css"

export default function BaseMap({
  children,
  initialCoordinates,
  ...props
}: MapProps & {
  children: React.ReactNode | Array<React.ReactNode>
  initialCoordinates?: Coordinates | undefined
}) {
  const mapStyle = import.meta.env.VITE_MAPLIBRE_STYLE_URL

  return (
    <MaplibreMap
      mapStyle={
        mapStyle ?? "https://antoncuranz.github.io/basemaps-assets/streets.json"
      }
      projection="globe"
      workerCount={2}
      maxParallelImageRequests={32}
      initialViewState={{
        latitude: initialCoordinates?.latitude ?? 52.520007,
        longitude: initialCoordinates?.longitude ?? 13.404954,
        zoom: 10,
      }}
      style={{ background: "#04162a" }}
      {...props}
    >
      <RenderAfterMap>{children}</RenderAfterMap>
    </MaplibreMap>
  )
}
