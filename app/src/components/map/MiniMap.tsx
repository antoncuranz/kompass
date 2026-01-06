import React from "react"
import { Marker, useMap } from "react-map-gl/maplibre"
import type { LngLat, MapMouseEvent } from "react-map-gl/maplibre"
import type { Coordinates } from "@/domain/location"
import BaseMap from "@/components/map/BaseMap.tsx"

export default function MiniMap({
  children,
  value,
  onChange,
}: {
  children: React.ReactNode | Array<React.ReactNode>
  value: Coordinates | undefined
  onChange: (newLocation: Coordinates) => void
}) {
  const { heroMap } = useMap()

  function getInitialCoordinates() {
    if (value) {
      return value
    } else if (heroMap) {
      return lngLatToCoordinates(heroMap.getCenter())
    } else {
      return undefined
    }
  }

  function onClick(event: MapMouseEvent) {
    onChange(lngLatToCoordinates(event.lngLat))
  }

  function lngLatToCoordinates(lngLat: LngLat) {
    return {
      latitude: lngLat.lat,
      longitude: lngLat.lng,
    }
  }

  return (
    <BaseMap initialCoordinates={getInitialCoordinates()} onClick={onClick}>
      {value && (
        <Marker longitude={value.longitude} latitude={value.latitude} />
      )}
      {children}
    </BaseMap>
  )
}
