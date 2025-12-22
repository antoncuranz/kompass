import { Outlet, createRootRoute, useParams } from "@tanstack/react-router"
import { JazzInspector } from "jazz-tools/inspector"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Auth } from "@/components/Auth"
import { useRequestListener } from "@/hooks/useRequestListener"
import { SharedTrip } from "@/schema"
import { titleCase } from "@/lib/misc-utils"
import { useInspector } from "@/components/provider/InspectorProvider"

function DynamicTitle() {
  const tripId = useParams({ strict: false }).trip

  useEffect(() => {
    let cancelled = false

    async function updateTitle() {
      if (!tripId) {
        document.title = "kompass"
        return
      }

      try {
        const sharedTrip = await SharedTrip.load(tripId, {
          resolve: { trip: true },
        })
        if (cancelled) return
        if (sharedTrip.$isLoaded) {
          document.title = `${sharedTrip.trip.name} | kompass`
        } else {
          document.title = `${titleCase(sharedTrip.$jazz.loadingState)} | kompass`
        }
      } catch {
        if (!cancelled) {
          document.title = "Error | kompass"
        }
      }
    }

    void updateTitle()

    return () => {
      cancelled = true
    }
  }, [tripId])

  return null
}

export const Route = createRootRoute({
  component: () => {
    useRequestListener()
    const { showInspector } = useInspector()

    return (
      <div className="root bg-background">
        <DynamicTitle />
        <Outlet />
        <Auth />
        <Toaster />
        {showInspector && <JazzInspector />}
      </div>
    )
  },
})
