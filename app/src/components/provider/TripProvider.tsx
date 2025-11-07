import { createCoValueSubscriptionContext } from "jazz-tools/react"
import { RESOLVE_SHARED_TRIP, SharedTrip } from "@/schema"

export const { Provider: TripProvider, useSelector: useSharedTrip } =
  createCoValueSubscriptionContext(SharedTrip, RESOLVE_SHARED_TRIP)

export const useTrip = () => {
  return useSharedTrip({ select: st => st.trip })
}
