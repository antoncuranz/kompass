import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import { Allotment } from "allotment"
import Navigation from "@/components/navigation/Navigation"
import MapPane from "@/components/map/MapPane"
import { TripProvider } from "@/components/provider/TripProvider"
import SkeletonCard from "@/components/card/SkeletonCard"
import TripAccessGuard from "@/components/TripAccessGuard"
import { titleCase } from "@/lib/misc-utils"
import Card from "@/components/card/Card"
import { useIsMobile, useIsTwoColumn } from "@/hooks/useResponsive"
import "allotment/dist/style.css"

export const Route = createFileRoute("/$trip")({
  component: RouteComponent,
})

function RouteComponent() {
  const sharedTripId = Route.useParams().trip

  const isMapRoute = useLocation({
    select: location => location.pathname.endsWith("/map"),
  })

  const isMobile = useIsMobile()
  const isTwoColumn = useIsTwoColumn()

  const shouldHideMap =
    useLocation({
      select: location => /\/files\/.+/.test(location.pathname),
    }) || !isTwoColumn

  return (
    <>
      <Navigation sharedTripId={sharedTripId} />
      <main className="w-full sm:px-4 md:px-6 md:gap-2 relative z-1 sm:h-[calc(100dvh-4.5rem)]">
        <MapProvider>
          <TripProvider
            id={sharedTripId}
            fallback={({ reason }) => (
              <SkeletonCard title={titleCase(reason)} />
            )}
          >
            {isMobile ? (
              <Outlet />
            ) : (
              <Card>
                <Allotment proportionalLayout={false}>
                  {!isMapRoute && (
                    <Allotment.Pane minSize={300} preferredSize={600}>
                      <Outlet />
                    </Allotment.Pane>
                  )}
                  {(!shouldHideMap || isMapRoute) && (
                    <Allotment.Pane minSize={300} snap>
                      <MapPane />
                    </Allotment.Pane>
                  )}
                </Allotment>
              </Card>
            )}
          </TripProvider>
        </MapProvider>
        <TripAccessGuard sharedTripId={sharedTripId} />
      </main>
    </>
  )
}
