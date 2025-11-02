"use client"

import { isMapbox } from "@/components/map/common.tsx"
import { ReactNode } from "react"
import { MapProvider as MapboxMapProvider } from "react-map-gl/mapbox"
import { MapProvider as MaplibreMapProvider } from "react-map-gl/maplibre"

export function MapProvider({
  ...props
}: {
  children: ReactNode | ReactNode[]
}) {
  return isMapbox ? (
    <MapboxMapProvider {...props} />
  ) : (
    <MaplibreMapProvider {...props} />
  )
}
