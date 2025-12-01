import React from "react"
import { Map as MaplibreMap } from "react-map-gl/maplibre"
import type { MapProps } from "react-map-gl/maplibre"
import type { Coordinates } from "@/types.ts"
import RenderAfterMap from "@/components/map/RenderAfterMap.tsx"
import config from "@/config"
import "maplibre-gl/dist/maplibre-gl.css"

export default function BaseMap({
  children,
  initialCoordinates,
  ...props
}: MapProps & {
  children: React.ReactNode | Array<React.ReactNode>
  initialCoordinates?: Coordinates | undefined
}) {
  return (
    <MaplibreMap
      mapStyle={config.MAPLIBRE_STYLE_URL}
      projection="globe"
      workerCount={2}
      maxParallelImageRequests={32}
      initialViewState={{
        latitude: initialCoordinates?.latitude ?? 52.520007,
        longitude: initialCoordinates?.longitude ?? 13.404954,
        zoom: 10,
      }}
      style={{ background: "#04162a" }}
      onIdle={() => {
        if (import.meta.env.MODE !== "production") {
          console.log("map idle")
        }
      }}
      {...props}
    >
      <RenderAfterMap>{children}</RenderAfterMap>
    </MaplibreMap>
  )
}
