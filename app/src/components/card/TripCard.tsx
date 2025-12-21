import { Pencil } from "lucide-react"
import type { Trip } from "@/schema.ts"
import type { co } from "jazz-tools"
import Card from "@/components/card/Card.tsx"
import { cn } from "@/lib/utils"

export default function TripCard({
  trip,
  className,
  fallbackColor,
  onEdit,
}: {
  trip: co.loaded<typeof Trip>
  sharedTripId: string
  className?: string
  fallbackColor: string
  onEdit: () => void
}) {
  return (
    <Card className={cn("relative group/trip-card p-2", className)}>
      <div className="relative h-full w-full rounded-2xl overflow-hidden">
        {trip.imageUrl && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-linear-to-b from-black/50 via-transparent to-transparent" />
        )}
        <div className="relative z-40 p-8">
          <div className="mt-2 max-w-xs text-left font-sans text-xl font-semibold text-balance text-white md:text-3xl">
            {trip.name}
          </div>
        </div>
        {trip.imageUrl ? (
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
        <div
          className="bg-card rounded-full p-2 cursor-pointer flex items-center justify-center"
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
