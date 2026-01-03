import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import type { Trip, UnavailableReason } from "@/domain"
import { isLoaded } from "@/domain"
import { useTrip as useTripFromRepo } from "@/repo"

const TripContext = createContext<Trip | null>(null)

export function TripProvider({
  stid,
  fallback,
  children,
}: {
  stid: string
  fallback: (props: { reason: UnavailableReason }) => ReactNode
  children: ReactNode
}) {
  const trip = useTripFromRepo(stid)

  return !isLoaded(trip) ? (
    fallback({ reason: trip })
  ) : (
    <TripContext.Provider value={trip}>{children}</TripContext.Provider>
  )
}

export function useTrip() {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error("useTrip must be used within TripProvider")
  }
  return context
}
