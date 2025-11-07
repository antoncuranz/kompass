import { MapProvider as MapboxMapProvider } from "react-map-gl/mapbox"
import { MapProvider as MaplibreMapProvider } from "react-map-gl/maplibre"
import type { ReactNode } from "react"
import { isMapbox } from "@/components/map/common.tsx"

export function MapProvider({
  ...props
}: {
  children: ReactNode | Array<ReactNode>
}) {
  return isMapbox ? (
    <MapboxMapProvider {...props} />
  ) : (
    <MaplibreMapProvider {...props} />
  )
}
