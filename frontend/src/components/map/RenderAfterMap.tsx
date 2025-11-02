"use client"

import { isMapbox, useMap } from "@/components/map/common.tsx"
import React, { useEffect, useState } from "react"
import { MapRef as MapboxRef } from "react-map-gl/mapbox"

export default function RenderAfterMap({
  children,
  theme,
}: {
  theme?: string
  children: React.ReactNode
}) {
  const map = useMap()
  const [canRender, setCanRender] = useState(false)

  if (isMapbox) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!map.current || !theme) return

      // @ts-expect-error i know
      const mapboxRef = map.current as MapboxRef
      mapboxRef.setConfigProperty("basemap", "lightPreset", theme)
    }, [map, theme])
  }

  useEffect(() => {
    map.current?.on("load", () => setCanRender(true))
  }, [map])

  return <>{canRender && children}</>
}
