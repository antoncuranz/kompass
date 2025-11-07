import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { UserAccount } from "@/schema"
import type { co } from "jazz-tools"
import { Toaster } from "@/components/ui/sonner"

export interface RouterContext {
  account: co.loaded<typeof UserAccount> | null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div className="root">
      <Outlet />
      <Toaster />
    </div>
  ),
})
