import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { MapProvider } from "react-map-gl/maplibre"
import Navigation from "@/components/navigation/Navigation"
import MapCard from "@/components/card/MapCard"
import { TripProvider } from "@/components/provider/TripProvider"
import SkeletonCard from "@/components/card/SkeletonCard"
import { cn } from "@/lib/utils"
import TripAccessGuard from "@/components/TripAccessGuard"

export const Route = createFileRoute("/$trip")({
  component: RouteComponent,
})

function RouteComponent() {
  const sharedTripId = Route.useParams().trip

  const isMapPage = useLocation({
    select: location => location.pathname.endsWith("/map"),
  })

  const pageCardClasses = "lg:max-w-3xl lg:min-w-152"
  const mapCardClasses = !isMapPage ? "hidden lg:block" : ""

  return (
    <>
      <Navigation sharedTripId={sharedTripId} />
      <main className="w-full sm:px-4 md:px-6 md:gap-2 relative z-1 sm:h-[calc(100dvh-4.5rem)]">
        <div className="flex h-full gap-4">
          <MapProvider>
            {!isMapPage && (
              <TripProvider
                id={sharedTripId}
                loadingFallback={<SkeletonCard className={pageCardClasses} />}
                unavailableFallback={
                  <SkeletonCard
                    className={pageCardClasses}
                    title="Unauthorized"
                  />
                }
              >
                <div className={cn(pageCardClasses, "w-full h-full")}>
                  <Outlet />
                </div>
              </TripProvider>
            )}
            <TripProvider
              id={sharedTripId}
              loadingFallback={<SkeletonCard className={mapCardClasses} />}
              unavailableFallback={
                <SkeletonCard className={mapCardClasses} title="Unauthorized" />
              }
            >
              <MapCard className={mapCardClasses} />
            </TripProvider>
          </MapProvider>
          <TripAccessGuard sharedTripId={sharedTripId} />
        </div>
      </main>
    </>
  )
}
