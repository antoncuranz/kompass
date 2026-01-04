import { Link, useLocation } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { CarouselHorizontal02Icon } from "@hugeicons/core-free-icons"
import { ProfileMenu } from "@/components/navigation/ProfileMenu.tsx"
import { SyncIndicator } from "@/components/navigation/SyncIndicator.tsx"
import { Button } from "@/components/ui/button.tsx"
import { cn } from "@/lib/utils"
import { titleCase } from "@/lib/misc-utils"
import { isLoaded } from "@/domain"
import { useUserRole } from "@/repo/userRepo"
import { useSingleTripRepo } from "@/repo"

export default function Navigation({ stid }: { stid: string }) {
  const { trip } = useSingleTripRepo(stid)
  const userRole = useUserRole(stid)
  const pathname = useLocation({
    select: location => location.pathname,
  })

  const commonStyle =
    "inline-block h-full sm:h-14 leading-9 sm:leading-14 border-accent"
  const activeStyle = cn(commonStyle, "text-foreground border-b-3")
  const inactiveStyle = cn(
    commonStyle,
    "text-muted-foreground transition-colors hover:text-foreground",
  )

  function getVisiblePages(): Array<
    "itinerary" | "notes" | "cost" | "files" | "map" | "share"
  > {
    if (!isLoaded(trip) || !userRole) return []

    if (userRole === "admin") {
      return ["itinerary", "notes", "cost", "files", "map", "share"]
    }

    if (userRole === "member") {
      return ["itinerary", "notes", "cost", "files", "map"]
    }

    return ["itinerary", "notes", "map"]
  }

  return (
    <header className="sticky top-0 pt-2 sm:pt-0 z-10 sm:z-0 h-22 sm:h-14 border-b sm:border-0 bg-background sm:px-4 md:px-6 shadow-sm sm:shadow-none">
      <nav className="font-medium flex flex-col sm:flex-row justify-between items-start sm:items-center sm:gap-2 text-sm w-full h-full">
        <div className="px-3 sm:px-0 flex flex-row not-sm:w-full">
          <Link to="/">
            <Button size="icon-lg" variant="secondary">
              <HugeiconsIcon icon={CarouselHorizontal02Icon} />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold leading-10 ml-2 grow sm:max-w-50 truncate">
            {isLoaded(trip) ? trip.name : trip}
          </h1>
          <div className="flex items-center justify-center gap-2 sm:hidden">
            <SyncIndicator />
            <ProfileMenu />
          </div>
        </div>
        <div
          className="text-base font-normal flex gap-6 lg:gap-8 overflow-x-auto w-full no-scrollbar items-center pl-5 md:pl-6 pr-10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent .0em, black 1em calc(100% - 3em), transparent calc(100% - .0em))",
          }}
        >
          {getVisiblePages().map(page => (
            <Link
              key={page}
              to={"/" + stid + "/" + page}
              className={
                pathname.includes("/" + page) ? activeStyle : inactiveStyle
              }
            >
              {titleCase(page)}
            </Link>
          ))}
        </div>
        <div className="hidden sm:flex items-center justify-center gap-2">
          <SyncIndicator />
          <ProfileMenu />
        </div>
      </nav>
    </header>
  )
}
