import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import "./styles.css"
import reportWebVitals from "./reportWebVitals.ts"
import { JazzProvider } from "./components/provider/JazzProvider.tsx"
import { ThemeProvider } from "./components/provider/ThemeProvider.tsx"
import { PrivacyProvider } from "./components/provider/PrivacyProvider.tsx"

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
            <RouterProvider router={router} />
          </PrivacyProvider>
        </ThemeProvider>
      </JazzProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
