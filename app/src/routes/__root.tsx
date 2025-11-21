import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { Auth } from "@/components/Auth"
import { useRequestListener } from "@/hooks/useRequestListener"

const JazzInspector =
  import.meta.env.MODE === "development"
    ? (await import("jazz-tools/inspector")).JazzInspector
    : () => null

export const Route = createRootRoute({
  component: () => {
    useRequestListener()

    return (
      <div className="root">
        <Outlet />
        <Auth />
        <Toaster />
        <JazzInspector />
      </div>
    )
  },
})
