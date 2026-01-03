import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import type { Trip } from "@/domain"
import { useTrip as useTripFromRepo } from "@/repo"
import { userHasRole } from "@/lib/collaboration-utils"

const TripContext = createContext<Trip | null>(null)

export function TripProvider({
  stid,
  fallback,
  children,
}: {
  stid: string
  fallback: (props: {
    reason: "loading" | "unavailable" | "unauthorized"
  }) => ReactNode
  children: ReactNode
}) {
  const trip = useTripFromRepo(stid)

  return trip === "loading" ||
    trip === "unauthorized" ||
    trip === "unavailable" ? (
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

export const useRole = () => {
  // const sharedTrip = useSharedTripEntity()

  // for (const role of Object.values(UserRole)) {
  //   if (userHasRole(sharedTrip, role)) {
  //     return role
  //   }
  // }

  return undefined
}
