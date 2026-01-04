import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./styles.css"
import { JazzProvider } from "./components/provider/JazzProvider.tsx"
import { ThemeProvider } from "./components/provider/ThemeProvider.tsx"
import { PrivacyProvider } from "./components/provider/PrivacyProvider.tsx"
import { InspectorProvider } from "./components/provider/InspectorProvider.tsx"

if (import.meta.env.MODE === "staging") {
  await import("./styles.staging.css")
}

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <JazzProvider>
        <ThemeProvider defaultTheme="system">
          <PrivacyProvider>
            <InspectorProvider>
              <RouterProvider router={router} />
            </InspectorProvider>
          </PrivacyProvider>
        </ThemeProvider>
      </JazzProvider>
    </StrictMode>,
  )
}
