import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"
import { Auth } from "@/components/Auth"

const JazzInspector =
  import.meta.env.MODE === "development"
    ? (await import("jazz-tools/inspector")).JazzInspector
    : () => null

export const Route = createRootRoute({
  component: () => (
    <div className="root">
      <Outlet />
      <Auth />
      <Toaster />
      <JazzInspector />
    </div>
  ),
})
