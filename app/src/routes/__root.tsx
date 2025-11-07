import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
  component: () => (
    <div className="root">
      <Outlet />
      <Toaster />
    </div>
  ),
})
