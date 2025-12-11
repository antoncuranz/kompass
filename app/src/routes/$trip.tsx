import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import Navigation from "@/components/navigation/Navigation"
import MapPane from "@/components/map/MapPane"
import { TripProvider } from "@/components/provider/TripProvider"
import SkeletonCard from "@/components/card/SkeletonCard"
import TripAccessGuard from "@/components/TripAccessGuard"
import { titleCase } from "@/components/util"
import { Allotment } from "allotment"
import Card from "@/components/card/Card"
import { BreakPointHooks, breakpointsTailwind } from "@react-hooks-library/core"
import "allotment/dist/style.css"

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

  const showMap = BreakPointHooks(breakpointsTailwind).useGreater("lg")

  return (
    <>
      <Navigation sharedTripId={sharedTripId} />
      <main className="w-full sm:px-4 md:px-6 md:gap-2 relative z-1 h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-4.5rem)]">
        <MapProvider>
          <TripProvider
            id={sharedTripId}
            fallback={({ reason }) => (
              <SkeletonCard title={titleCase(reason)} />
            )}
          >
            <Card>
              {shouldHideMap ? (
                <Outlet />
              ) : (
                <Allotment proportionalLayout={false}>
                  {!isMapRoute && (
                    <Allotment.Pane minSize={300} preferredSize={600}>
                      <Outlet />
                    </Allotment.Pane>
                  )}
                  {(isMapRoute || showMap) && (
                    <Allotment.Pane minSize={300} snap>
                      <MapPane />
                    </Allotment.Pane>
                  )}
                </Allotment>
              )}
            </Card>
          </TripProvider>
        </MapProvider>
        <TripAccessGuard sharedTripId={sharedTripId} />
      </main>
    </>
  )
}
