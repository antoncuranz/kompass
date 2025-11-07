import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$trip/map")({
  component: MapPage,
})

function MapPage() {
  return null
}
