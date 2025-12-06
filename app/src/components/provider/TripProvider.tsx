import { useEffect, useState } from "react"
import { createCoValueSubscriptionContext } from "jazz-tools/react"
import type { ReactNode } from "react"
import type { Transportation } from "@/schema"
import { SharedTrip } from "@/schema"
import { loadTransportation } from "@/lib/utils"

const { Provider: JazzTripProvider, useSelector: useSharedTrip } =
  createCoValueSubscriptionContext(SharedTrip, SharedTrip.resolveQuery)

export { useSharedTrip }

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
  return useSharedTrip({ select: st => st.trip })
}

export const useTransportation = () => {
  const transportation = useSharedTrip({ select: st => st.trip.transportation })
  const [loaded, setLoaded] = useState<Array<Transportation>>([])

  useEffect(() => {
    async function loadAll() {
      const result = await Promise.all(
        transportation.map(async t => await loadTransportation(t)),
      )
      setLoaded(result)
    }

    loadAll()
  }, [transportation])

  return loaded
}
