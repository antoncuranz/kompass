import { SharedProperties } from "@/types.ts"
import type { FeatureCollection } from "geojson"
import { LngLat as MapboxLngLat } from "mapbox-gl"
import { LngLat as MaplibreLngLat } from "maplibre-gl"
import { ReactNode } from "react"
import {
  Layer as MapboxLayer,
  MapProps as MapboxMapProps,
  Marker as MapboxMarker,
  MarkerProps as MapboxMarkerProps,
  MapMouseEvent as MapboxMouseEvent,
  Popup as MapboxPopup,
  PopupProps as MapboxPopupProps,
  MapRef as MapboxRef,
  Source as MapboxSource,
  useMap as useMapboxMap,
} from "react-map-gl/mapbox"
import {
  Layer as MaplibreLayer,
  MapProps as MaplibreMapProps,
  Marker as MaplibreMarker,
  MarkerProps as MaplibreMarkerProps,
  MapMouseEvent as MaplibreMouseEvent,
  Popup as MaplibrePopup,
  PopupProps as MaplibrePopupProps,
  MapRef as MaplibreRef,
  Source as MaplibreSource,
  useMap as useMaplibreMap,
} from "react-map-gl/maplibre"

export const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
export const mapStyle = process.env.NEXT_PUBLIC_MAP_STYLE
export const isMapbox: boolean = !!mapboxToken

export type MapMouseEvent = MapboxMouseEvent | MaplibreMouseEvent
export type MapProps = SharedProperties<MaplibreMapProps, MapboxMapProps>
export type LngLat = MapboxLngLat | MaplibreLngLat

export function Marker(
  props: SharedProperties<MaplibreMarkerProps, MapboxMarkerProps>,
) {
  return isMapbox ? <MapboxMarker {...props} /> : <MaplibreMarker {...props} />
}

export function Source(props: {
  type: "geojson" | "vector"
  data: FeatureCollection
  children: ReactNode | ReactNode[]
}) {
  return isMapbox ? <MapboxSource {...props} /> : <MaplibreSource {...props} />
}

export function Layer(props: {
  id?: string
  type: "line" | "circle"
  paint: {
    "circle-color"?: string
    "circle-radius"?: number
    "circle-stroke-color"?: string
    "circle-stroke-width"?: number
    "line-color"?: string
    "line-width"?: number
  }
  layout?: any
  filter?: any
}) {
  return isMapbox ? <MapboxLayer {...props} /> : <MaplibreLayer {...props} />
}

export function Popup(
  props: SharedProperties<MaplibrePopupProps, MapboxPopupProps>,
) {
  return isMapbox ? <MapboxPopup {...props} /> : <MaplibrePopup {...props} />
}

export type MapRef = SharedProperties<MaplibreRef, MapboxRef>

export type MapCollection = {
  [id: string]: MapRef | undefined
  current?: MapRef
}

export function useMap(): MapCollection {
  return isMapbox
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      (useMapboxMap() as MapCollection)
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      (useMaplibreMap() as MapCollection)
}
