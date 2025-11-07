import { TanStackDevtools } from "@tanstack/react-devtools"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { UserAccount } from "@/schema"
import type { co } from "jazz-tools"
import { Toaster } from "@/components/ui/sonner"

export interface MyRouterContext {
  account: co.loaded<typeof UserAccount> | null
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="root">
      <Outlet />
      <Toaster />
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </div>
  ),
})
