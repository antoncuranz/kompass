"use client"

import Card from "@/components/card/Card.tsx"
import ShareButton from "@/components/buttons/ShareButton.tsx"
import { cn } from "@/lib/utils.ts"
import { Trip } from "@/schema.ts"
import { Pencil } from "lucide-react"

export default function TripCard({
  trip,
  sharedTripId,
  className,
  fallbackColor,
  onEdit,
}: {
  trip: Trip
  sharedTripId: string
  className?: string
  fallbackColor: string
  onEdit: () => void
}) {
  return (
    <Card
      className={cn("relative group/trip-card", className)}
      onSmallDevices
    >
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
              background: fallbackColor,
            }}
          />
        )}
      </div>
      <div className="absolute bottom-4 right-4 z-50 flex gap-2 hidden group-hover/trip-card:flex not-sm:flex">
        <ShareButton
          sharedTripId={sharedTripId}
          className="rounded-full p-2 h-auto w-auto"
        />
        <div
          className="bg-background rounded-full p-2 cursor-pointer flex items-center justify-center"
          onClick={e => {
            e.preventDefault()
            onEdit()
          }}
        >
          <Pencil className="h-4 w-4" />
        </div>
      </div>
    </Card>
  )
}
