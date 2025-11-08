import { Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useAccount } from "jazz-tools/react"
import type { co } from "jazz-tools"
import type { Trip } from "@/schema"
import { UserAccount } from "@/schema"
import { ModeToggle } from "@/components/buttons/ModeToggle"
import NewTripCard from "@/components/card/NewTripCard"
import TripCard from "@/components/card/TripCard"
import TripDialog from "@/components/dialog/TripDialog"
import { Carousel } from "@/components/ui/cards-carousel"

export const Route = createFileRoute("/")({
  component: App,
})

function App() {
  const account = useAccount(UserAccount)
  const [tripDialogOpen, setTripDialogOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<
    co.loaded<typeof Trip> | undefined
  >(undefined)

  if (!account.$isLoaded) {
    return account.$jazz.loadingState !== "loading" ? (
      <>Error loading data</>
    ) : null
  }

  const fallbackColors = ["#0081A7", "#459f00", "#FED9B7", "#F07167"]
  const cardClasses =
    "aspect-3/5 min-h-[20rem] sm:min-h-[26rem] h-[calc(100vh-20rem)] md:h-[calc(100vh-26rem)] max-h-160"

  const cards = account.root.trips.map((sharedTrip, idx) => (
    <Link
      key={sharedTrip.$jazz.id}
      to={"/" + sharedTrip.$jazz.id + "/itinerary"}
    >
      <TripCard
        trip={sharedTrip.trip}
        sharedTripId={sharedTrip.$jazz.id}
        className={cardClasses}
        fallbackColor={fallbackColors[idx % fallbackColors.length]}
        onEdit={() => {
          setSelectedTrip(sharedTrip.trip)
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
          <ModeToggle />
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
              Hello {account.profile.name}!<br />
              Let's manage your trips
            </h2>
            <Carousel items={cards} />
          </div>
        </div>
      </main>
      <TripDialog
        account={account}
        trip={selectedTrip}
        open={tripDialogOpen}
        onOpenChange={setTripDialogOpen}
      />
    </>
  )
}
