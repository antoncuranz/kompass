import React, { useState } from "react"
import { Popup } from "react-map-gl/maplibre"
import AccommodationLayer from "./layers/AccommodationLayer"
import ActivityLayer from "./layers/ActivityLayer"
import TransportationLayer from "./layers/TransportationLayer"
import type { MapMouseEvent } from "react-map-gl/maplibre"
import type { GeoJsonProperties } from "geojson"
import type {
  GeoJsonFlight,
  GeoJsonTrain,
  GeoJsonTransportation,
} from "@/components/map/types"
import type { LngLat } from "maplibre-gl"
import { useTrip } from "@/components/provider/TripProvider"
import BaseMap from "@/components/map/BaseMap.tsx"
import FlightPopup from "@/components/map/popup/FlightPopup.tsx"
import TrainPopup from "@/components/map/popup/TrainPopup.tsx"
import TransportationPopup from "@/components/map/popup/TransportationPopup"
import { useTransportationSubscription } from "@/repo"

type PopupInfo = {
  lngLat: LngLat
  children: React.ReactNode
}

export default function HeroMap() {
  const stid = useTrip().stid
  const { transportation } = useTransportationSubscription(stid)
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

  function onMouseEnter(event: MapMouseEvent) {
    if (!event.features || event.features.length == 0) return

    const featureProperties = event.features
      .filter(feature => feature.properties["type"])
      .map(feature => feature.properties)

    setPopupInfo({
      lngLat: event.lngLat,
      children: featureProperties.map((properties, idx) => (
        <div key={idx}>{renderPopupContent(properties)}</div>
      )),
    })
  }

  function renderPopupContent(props: GeoJsonProperties) {
    switch (props!["type"]) {
      case "ACTIVITY":
      case "ACCOMMODATION":
        return (
          <div className="text-sm">
            <strong>{props!["popupTitle"]}</strong>
            <div className="iconsolata grid grid-cols-[auto_auto_1fr] gap-x-2">
              {props!["popupBody"]}
            </div>
          </div>
        )
      case "FLIGHT":
        return <FlightPopup properties={props as GeoJsonFlight} />
      case "TRAIN":
        return <TrainPopup properties={props as GeoJsonTrain} />
      default:
        return (
          <TransportationPopup properties={props as GeoJsonTransportation} />
        )
    }
  }

  const geoJsonLayers = transportation
    .filter(t => t.geoJson !== undefined)
    .map((_, idx) => "geojson" + idx)

  return (
    <BaseMap
      id="heroMap"
      interactiveLayerIds={geoJsonLayers.concat(["activity", "accommodation"])}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseEnter}
      onMouseLeave={() => setPopupInfo(null)}
    >
      <ActivityLayer />
      <AccommodationLayer />
      <TransportationLayer />
      {popupInfo && (
        <Popup
          offset={10}
          closeButton={false}
          closeOnClick={false}
          longitude={popupInfo.lngLat.lng}
          latitude={popupInfo.lngLat.lat}
          maxWidth={undefined}
          className="shadow-xl bg-card"
        >
          {popupInfo.children}
        </Popup>
      )}
    </BaseMap>
  )
}
