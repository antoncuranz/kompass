import { createFileRoute } from "@tanstack/react-router"
import MapPane from "@/components/map/MapPane"

export const Route = createFileRoute("/$trip/map")({
  component: MobileMapPage,
})

function MobileMapPage() {
  return (
    <div className="h-[calc(100dvh-5.5rem)]">
      <MapPane />
    </div>
  )
}
