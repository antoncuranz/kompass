import { useEffect, useState } from "react"
import { createCoValueSubscriptionContext } from "jazz-tools/react"
import type { ReactNode } from "react"
import type { Transportation } from "@/repo/jazzSchema"
import { SharedTripEntity } from "@/repo/jazzSchema"
import { loadTransportation } from "@/lib/transportation-utils"
import { UserRole, userHasRole } from "@/lib/collaboration-utils"

const { Provider: JazzTripProvider, useSelector: useSharedTripEntity } =
  createCoValueSubscriptionContext(
    SharedTripEntity,
    SharedTripEntity.resolveQuery,
  )

export { useSharedTripEntity }

export function TripProvider({
  id,
  fallback,
  children,
}: {
  id: string
  fallback: (props: { reason: "loading" | "unavailable" }) => ReactNode
  children: ReactNode
}) {
  return (
    <JazzTripProvider
      id={id}
      loadingFallback={fallback({ reason: "loading" })}
      unavailableFallback={fallback({ reason: "unavailable" })}
    >
      {children}
    </JazzTripProvider>
  )
}

export const useTrip = () => {
  return useSharedTripEntity({ select: st => st.trip })
}

export const useRole = () => {
  const sharedTrip = useSharedTripEntity()

  for (const role of Object.values(UserRole)) {
    if (userHasRole(sharedTrip, role)) {
      return role
    }
  }

  return undefined
}

export const useTransportation = () => {
  const transportation = useSharedTripEntity({
    select: st => st.trip.transportation,
  })
  const [loaded, setLoaded] = useState<Array<Transportation>>([])

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      const result = await Promise.all(
        transportation.map(async t => await loadTransportation(t)),
      )
      if (!cancelled) {
        setLoaded(result)
      }
    }

    void loadAll()

    return () => {
      cancelled = true
    }
  }, [transportation])

  return loaded
}
