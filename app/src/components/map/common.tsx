import {
  Layer as MapboxLayer,
  Marker as MapboxMarker,
  Popup as MapboxPopup,
  Source as MapboxSource,
  useMap as useMapboxMap,
} from "react-map-gl/mapbox"
import {
  Layer as MaplibreLayer,
  Marker as MaplibreMarker,
  Popup as MaplibrePopup,
  Source as MaplibreSource,
  useMap as useMaplibreMap,
} from "react-map-gl/maplibre"
import type { LngLat as MapboxLngLat } from "mapbox-gl"
import type { LngLat as MaplibreLngLat } from "maplibre-gl"
import type { ReactNode } from "react"
import type {
  MapProps as MapboxMapProps,
  MarkerProps as MapboxMarkerProps,
  MapMouseEvent as MapboxMouseEvent,
  PopupProps as MapboxPopupProps,
  MapRef as MapboxRef,
} from "react-map-gl/mapbox"
import type {
  MapProps as MaplibreMapProps,
  MarkerProps as MaplibreMarkerProps,
  MapMouseEvent as MaplibreMouseEvent,
  PopupProps as MaplibrePopupProps,
  MapRef as MaplibreRef,
} from "react-map-gl/maplibre"
import type { FeatureCollection } from "geojson"
import type { SharedProperties } from "@/types.ts"

export const mapboxToken = undefined
export const mapStyle = undefined
export const isMapbox = false

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
  children: ReactNode | Array<ReactNode>
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
    ? (useMapboxMap() as MapCollection)
    : (useMaplibreMap() as MapCollection)
}
