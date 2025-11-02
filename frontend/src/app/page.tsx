"use client"

import { ModeToggle } from "@/components/buttons/ModeToggle.tsx"
import Card from "@/components/card/Card.tsx"
import NewTripCard from "@/components/card/NewTripCard.tsx"
import { Carousel } from "@/components/ui/cards-carousel.tsx"
import { JazzAccount, RESOLVE_ACCOUNT } from "@/schema.ts"
import { useAccount } from "jazz-tools/react-core"
import Link from "next/link"

export default function Page() {
  const { me: account } = useAccount(JazzAccount, { resolve: RESOLVE_ACCOUNT })

  if (!account) {
    return <>Error loading data</>
  }

  const fallbackColors = ["#0081A7", "#459f00", "#FED9B7", "#F07167"]
  const cardClasses =
    "aspect-3/5 min-h-[20rem] sm:min-h-[26rem] h-[calc(100vh-20rem)] md:h-[calc(100vh-26rem)] max-h-160"

  const cards = account.root.trips.map((trip, idx) => (
    <Link key={trip.$jazz.id} href={"/" + trip.$jazz.id + "/itinerary"}>
      <Card className={cardClasses} onSmallDevices>
        <div className="relative h-full w-full">
          {trip.imageUrl && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-linear-to-b from-black/50 via-transparent to-transparent" />
          )}
          <div className="relative z-40 p-8">
            <div className="mt-2 max-w-xs text-left font-sans text-xl font-semibold text-balance text-white md:text-3xl">
              {trip.name}
            </div>
          </div>
          {trip.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="absolute inset-0 z-10 object-cover h-full max-w-none w-auto transition duration-300"
              src={trip.imageUrl}
              alt=""
            />
          ) : (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: fallbackColors[idx % fallbackColors.length],
              }}
            />
          )}
        </div>
      </Card>
    </Link>
  ))

  cards.push(<NewTripCard account={account} className={cardClasses} />)

  return (
    <>
      <header className="h-14 px-3 sm:px-4 md:px-6">
        <nav className="font-medium flex flex-row justify-between items-center sm:gap-2 text-sm w-full h-full">
          <Link href="/">
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
              Let&apos;s manage your trips
            </h2>
            <Carousel items={cards} />
          </div>
        </div>
      </main>
    </>
  )
}
