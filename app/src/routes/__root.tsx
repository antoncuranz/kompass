import { Outlet, createRootRoute, useParams, useRouterState } from "@tanstack/react-router"
import { JazzInspector } from "jazz-tools/inspector"
import { useEffect } from "react"
import { PostHogProvider, usePostHog } from "posthog-js/react"
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

function PageviewTracker() {
  const posthog = usePostHog()
  const location = useRouterState({ select: (s) => s.location })

  useEffect(() => {
    posthog.capture("$pageview", { $current_url: window.location.href })
  }, [location.pathname, posthog])

  return null
}

export const Route = createRootRoute({
  component: () => {
    useRequestListener()
    const { showInspector } = useInspector()

    return (
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN}
        options={{
          api_host: "/ingest",
          ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
          defaults: "2026-01-30",
          capture_exceptions: true,
          debug: import.meta.env.DEV,
        }}
      >
        <div className="root">
          <PageviewTracker />
          <DynamicTitle />
          <Outlet />
          <Auth />
          <Toaster />
          {showInspector && <JazzInspector />}
        </div>
      </PostHogProvider>
    )
  },
})
