import { useEffect, useState } from "react"
import { createCoValueSubscriptionContext } from "jazz-tools/react"
import type { Transportation } from "@/schema"
import { SharedTrip } from "@/schema"
import { loadTransportation } from "@/lib/utils"

export const { Provider: TripProvider, useSelector: useSharedTrip } =
  createCoValueSubscriptionContext(SharedTrip, SharedTrip.resolveQuery)

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
