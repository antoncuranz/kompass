"use client"

import BaseMap from "@/components/map/BaseMap.tsx"
import {
  Layer,
  LngLat,
  MapMouseEvent,
  Popup,
  Source,
} from "@/components/map/common.tsx"
import FlightPopup from "@/components/map/popup/FlightPopup.tsx"
import TrainPopup from "@/components/map/popup/TrainPopup.tsx"
import TransportationPopup from "@/components/map/popup/TransportationPopup"
import { formatDateShort } from "@/components/util.ts"
import { Accommodation, Activity } from "@/schema.ts"
import {
  GeoJsonFlight,
  GeoJsonTrain,
  GeoJsonTransportation,
  TransportationType,
} from "@/types.ts"
import type { Feature, FeatureCollection, GeoJsonProperties } from "geojson"
import React, { useState } from "react"

export default function HeroMap({
  activities,
  accommodation,
  geojson,
}: {
  activities: Activity[]
  accommodation: Accommodation[]
  geojson: GeoJSON.FeatureCollection[]
}) {
  type PopupInfo = {
    lngLat: LngLat
    children: React.ReactNode
  }
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null)

  function getActivityGeoJson(): FeatureCollection {
    const features = activities
      .filter(activity => activity.location)
      .map(mapActivityToFeature)

    return { type: "FeatureCollection", features: features }
  }

  function mapActivityToFeature(activity: Activity): Feature {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          activity.location!.longitude,
          activity.location!.latitude,
        ],
      },
      properties: {
        type: "ACTIVITY",
        popupTitle: activity.name,
        popupBody: formatDateShort(activity.date), // TODO: show time again!
        // "popupBody": formatDateShort(activity.date) + (activity.time ? " " + formatTime(activity.time) : "")
      },
    }
  }

  function getAccommodationGeoJson(): FeatureCollection {
    const features = accommodation
      .filter(activity => activity.location)
      .map(mapAccommodationToFeature)

    return { type: "FeatureCollection", features: features }
  }

  function mapAccommodationToFeature(accommodation: Accommodation): Feature {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          accommodation.location!.longitude,
          accommodation.location!.latitude,
        ],
      },
      properties: {
        type: "ACCOMMODATION",
        popupTitle: `🛏️ ${accommodation.name}`,
        popupBody: `${formatDateShort(accommodation.arrivalDate)}-${formatDateShort(accommodation.departureDate)}`,
      },
    }
  }

  function onMouseEnter(event: MapMouseEvent) {
    if (!event.features || event.features.length == 0) return

    const featureProperties = event.features
      .filter(feature => feature.properties && feature.properties["type"])
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

  function getColorByType(fc: FeatureCollection) {
    // @ts-expect-error custom property
    const type = fc["transportationType"] as TransportationType

    switch (type) {
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

  function sortedGeojson() {
    return geojson.sort((a, b) => {
      return (
        // @ts-expect-error custom property
        typeRank(a["transportationType"]) - typeRank(b["transportationType"])
      )
    })
  }

  return (
    <BaseMap
      id="heroMap"
      interactiveLayerIds={geojson
        .map((_, idx) => "geojson" + idx)
        .concat(["activity", "accommodation", "flight"])}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseEnter}
      onMouseLeave={() => setPopupInfo(null)}
    >
      <Source type="geojson" data={getActivityGeoJson()}>
        <Layer
          id="activity"
          type="circle"
          paint={{
            "circle-color": "#59B900",
            "circle-radius": 5,
            "circle-stroke-color": "white",
            "circle-stroke-width": 3,
          }}
        />
      </Source>
      <Source type="geojson" data={getAccommodationGeoJson()}>
        <Layer
          id="accommodation"
          type="circle"
          paint={{
            "circle-color": "#f4b682",
            "circle-radius": 5,
            "circle-stroke-color": "white",
            "circle-stroke-width": 3,
          }}
        />
      </Source>
      {sortedGeojson().map((fc, idx) => (
        <Source key={idx} type="geojson" data={fc}>
          <Layer
            type="line"
            paint={{ "line-color": getColorByType(fc), "line-width": 5 }}
            layout={{ "line-cap": "round" }}
          />
          <Layer
            type="circle"
            id={"geojson" + idx}
            filter={["==", ["geometry-type"], "Point"]}
            paint={{
              "circle-color": getColorByType(fc),
              "circle-radius": 5,
              "circle-stroke-color": "white",
              "circle-stroke-width": 3,
            }}
          />
        </Source>
      ))}
      {popupInfo && (
        <Popup
          offset={10}
          closeButton={false}
          closeOnClick={false}
          longitude={popupInfo.lngLat.lng}
          latitude={popupInfo.lngLat.lat}
          maxWidth={undefined}
          className="shadow-xl bg-background"
        >
          {popupInfo.children}
        </Popup>
      )}
    </BaseMap>
  )
}
