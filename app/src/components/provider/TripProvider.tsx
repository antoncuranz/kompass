import { createCoValueSubscriptionContext } from "jazz-tools/react"
import { SharedTrip } from "@/schema"

export const { Provider: TripProvider, useSelector: useSharedTrip } =
  createCoValueSubscriptionContext(SharedTrip, SharedTrip.resolveQuery)

export const useTrip = () => {
  return useSharedTrip({ select: st => st.trip })
}
