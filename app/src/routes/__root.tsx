import { Outlet, createRootRoute, useParams } from "@tanstack/react-router"
import { JazzInspector } from "jazz-tools/inspector"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { Auth } from "@/components/Auth"
import { useRequestListener } from "@/hooks/useRequestListener"
import { useInspector } from "@/components/provider/InspectorProvider"
import { useTripQuery } from "@/repo"

function DynamicTitle() {
  const tripId = useParams({ strict: false }).trip
  const trip = useTripQuery(tripId).trip

  useEffect(() => {
    if (!trip.$isLoaded) {
      document.title = "kompass"
    } else {
      document.title = `${trip.name} | kompass`
    }
  }, [trip])

  return null
}

export const Route = createRootRoute({
  component: () => {
    useRequestListener()
    const { showInspector } = useInspector()

    return (
      <div className="root">
        <DynamicTitle />
        <Outlet />
        <Auth />
        <Toaster />
        {showInspector && <JazzInspector />}
      </div>
    )
  },
})
