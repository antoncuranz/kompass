import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import Navigation from "@/components/navigation/Navigation"
import MapCard from "@/components/card/MapCard"
import { TripProvider } from "@/components/provider/TripProvider"
import SkeletonCard from "@/components/card/SkeletonCard"
import TwoCardLayout from "@/components/layout/TwoCardLayout"
import TripAccessGuard from "@/components/TripAccessGuard"
import { titleCase } from "@/components/util"

export const Route = createFileRoute("/$trip")({
  component: RouteComponent,
})

function RouteComponent() {
  const sharedTripId = Route.useParams().trip

  const shouldHideMap = useLocation({
    select: location => /\/files\/.+/.test(location.pathname),
  })

  const isMapRoute = useLocation({
    select: location => location.pathname.endsWith("/map"),
  })

  return (
    <>
      <Navigation sharedTripId={sharedTripId} />
      <main className="w-full sm:px-4 md:px-6 md:gap-2 relative z-1 h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-4.5rem)]">
        <MapProvider>
          <TripProvider
            id={sharedTripId}
            fallback={({ reason }) => (
              <TwoCardLayout
                leftCard={<SkeletonCard title={titleCase(reason)} />}
                rightCard={<SkeletonCard />}
              />
            )}
          >
            {shouldHideMap ? (
              <Outlet />
            ) : (
              <TwoCardLayout
                leftCard={<Outlet />}
                rightCard={<MapCard />}
                primaryCard={isMapRoute ? "right" : "left"}
              />
            )}
          </TripProvider>
        </MapProvider>
        <TripAccessGuard sharedTripId={sharedTripId} />
      </main>
    </>
  )
}
