import { Outlet, createRootRoute, useParams } from "@tanstack/react-router"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Auth } from "@/components/Auth"
import { useRequestListener } from "@/hooks/useRequestListener"
import { SharedTrip } from "@/schema"
import { titleCase } from "@/components/util"

const JazzInspector =
  import.meta.env.MODE === "development"
    ? (await import("jazz-tools/inspector")).JazzInspector
    : () => null

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

    return (
      <div className="root">
        <DynamicTitle />
        <Outlet />
        <Auth />
        <Toaster />
        <JazzInspector />
      </div>
    )
  },
})
