import { Outlet, createRootRoute, useParams, useRouterState } from "@tanstack/react-router"
import { JazzInspector } from "jazz-tools/inspector"
import { useEffect } from "react"
import { PostHogProvider, usePostHog } from "posthog-js/react"
import { Toaster } from "@/components/ui/sonner"
import { Auth } from "@/components/Auth"
import { useRequestListener } from "@/hooks/useRequestListener"
import { useInspector } from "@/components/provider/InspectorProvider"
import { useTripQuery } from "@/repo"
import config from "@/config"

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
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    posthog.capture("$pageview", { $current_url: window.location.href })
  }, [pathname, posthog])

  return null
}

export const Route = createRootRoute({
  component: () => {
    useRequestListener()
    const { showInspector } = useInspector()

    return (
      <PostHogProvider
        apiKey={config.POSTHOG_PROJECT_TOKEN || ""}
        options={{
          api_host: config.POSTHOG_HOST,
          defaults: "2026-01-30",
          capture_exceptions: true,
          debug: true, // import.meta.env.DEV,
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
