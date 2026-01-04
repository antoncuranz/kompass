import { Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import type { Trip } from "@/domain"
import { isLoaded } from "@/domain"
import { ProfileMenu } from "@/components/navigation/ProfileMenu"
import NewTripCard from "@/components/card/NewTripCard"
import TripCard from "@/components/card/TripCard"
import TripDialog from "@/components/dialog/TripDialog"
import { Carousel } from "@/components/ui/cards-carousel"
import { useTripRepo } from "@/repo"
import { useUserRepo } from "@/repo/userRepo"

export const Route = createFileRoute("/")({
  component: App,
})

function App() {
  const { user } = useUserRepo()
  const { trips } = useTripRepo()
  const [tripDialogOpen, setTripDialogOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>(undefined)

  if (!isLoaded(user)) {
    return user !== "loading" ? <>Error loading data</> : null
  }

  const fallbackColors = ["#0081A7", "#459f00", "#FED9B7", "#F07167"]
  const cardClasses =
    "aspect-3/5 min-h-[20rem] sm:min-h-[26rem] h-[calc(100vh-20rem)] md:h-[calc(100vh-26rem)] max-h-160"

  const cards = trips.map((trip: Trip, idx) => (
    <Link key={trip.stid} to={"/" + trip.stid + "/itinerary"}>
      <TripCard
        trip={trip} // TODO: sometimes, trip is undefined (race condition?)
        className={cardClasses}
        fallbackColor={fallbackColors[idx % fallbackColors.length]}
        onEdit={() => {
          setSelectedTrip(trip)
          setTripDialogOpen(true)
        }}
      />
    </Link>
  ))

  cards.push(
    <NewTripCard
      className={cardClasses}
      onClick={() => {
        setSelectedTrip(undefined)
        setTripDialogOpen(true)
      }}
    />,
  )

  return (
    <>
      <header className="h-14 px-3 sm:px-4 md:px-6">
        <nav className="font-medium flex flex-row justify-between items-center sm:gap-2 text-sm w-full h-full">
          <Link to="/">
            <strong>🧭 kompass</strong>
          </Link>
          <ProfileMenu />
        </nav>
      </header>
      <main
        id="root"
        className="w-full relative z-1"
        style={{ height: "calc(100dvh - 4rem)" }}
      >
        <div className="flex h-full gap-4">
          <div className="w-full h-full py-6">
            <h2 className="max-w-7xl pl-4 mx-auto text-3xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
              Hello {user.name}!<br />
              Let's plan your trips
            </h2>
            <Carousel items={cards} />
          </div>
        </div>
      </main>
      <TripDialog
        trip={selectedTrip}
        open={tripDialogOpen}
        onOpenChange={setTripDialogOpen}
      />
    </>
  )
}
