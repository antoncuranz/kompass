import { GalleryHorizontalEnd } from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"
import { useCoState } from "jazz-tools/react-core"
import { ButtonGroup } from "../ui/button-group"
import { SharedTrip } from "@/schema.ts"
import { ProfileMenu } from "@/components/navigation/ProfileMenu.tsx"
import { SyncIndicator } from "@/components/navigation/SyncIndicator.tsx"
import { Button } from "@/components/ui/button.tsx"
import { cn } from "@/lib/utils.ts"

export default function Navigation({ sharedTripId }: { sharedTripId: string }) {
  const sharedTrip = useCoState(SharedTrip, sharedTripId, {
    resolve: { admins: true, trip: true },
  })
  const pathname = useLocation({
    select: location => location.pathname,
  })

  const commonStyle =
    "inline-block h-10 sm:h-14 leading-9 sm:leading-14 border-[chocolate]"
  const activeStyle = cn(commonStyle, "text-foreground border-b-3")
  const inactiveStyle = cn(
    commonStyle,
    "text-muted-foreground transition-colors hover:text-foreground",
  )

  return (
    <header className="sticky top-0 pt-2 sm:pt-0 z-10 sm:z-0 h-22 sm:h-14 border-b sm:border-0 bg-background sm:px-4 md:px-6 shadow-lg sm:shadow-none shadow-black/2 dark:shadow-white/4">
      <nav className="font-medium flex flex-col sm:flex-row justify-between items-start sm:items-center sm:gap-2 text-sm w-full h-full">
        <div className="px-3 sm:px-0 flex flex-row w-full sm:w-auto">
          <ButtonGroup className="grow">
            <Link to="/">
              <Button size="sm" variant="outline" className="rounded-l-full">
                <GalleryHorizontalEnd />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="rounded-r-full pointer-events-none text-base pr-4"
            >
              {sharedTrip.$isLoaded
                ? sharedTrip.trip.name
                : sharedTrip.$jazz.loadingState}
            </Button>
          </ButtonGroup>
          <div className="flex items-center justify-center gap-2 sm:hidden">
            <SyncIndicator />
            <ProfileMenu />
          </div>
        </div>
        <div
          className="flex gap-6 lg:gap-8 overflow-x-auto w-full no-scrollbar items-center pl-5 md:pl-6 pr-10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent .0em, black 1em calc(100% - 3em), transparent calc(100% - .0em))",
          }}
        >
          {["Itinerary", "Notes", "Cost", "Map"].map(page => (
            <Link
              key={page.toLowerCase()}
              to={"/" + sharedTripId + "/" + page.toLowerCase()}
              className={
                pathname.endsWith("/" + page.toLowerCase())
                  ? activeStyle
                  : inactiveStyle
              }
            >
              {page}
            </Link>
          ))}
          {sharedTrip.$isLoaded && sharedTrip.admins.myRole() === "admin" && (
            <Link
              to={"/" + sharedTripId + "/share"}
              className={
                pathname.endsWith("/share") ? activeStyle : inactiveStyle
              }
            >
              Share
            </Link>
          )}
        </div>
        <div className="hidden sm:flex items-center justify-center gap-2">
          <SyncIndicator />
          <ProfileMenu />
        </div>
      </nav>
    </header>
  )
}
