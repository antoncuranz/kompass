import { useAccommodationSubscription } from "@/repo/accommodation"
import { useActivitySubscription } from "@/repo/activity"
import { useTransportationSubscription } from "@/repo/transportation"

/**
 * Composite hook that provides read-only access to all trip entities.
 * Use this when you need activities, accommodation, and transportation data together.
 * For mutations (create/update/remove), use the individual mutation hooks instead.
 */
export function useTripEntities(stid: string) {
  const { activities } = useActivitySubscription(stid)
  const { accommodation } = useAccommodationSubscription(stid)
  const { transportation } = useTransportationSubscription(stid)

  return { activities, accommodation, transportation }
}
