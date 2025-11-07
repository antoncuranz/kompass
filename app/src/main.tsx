import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { useAccount } from "jazz-tools/react"
import { routeTree } from "./routeTree.gen"
import "./styles.css"
import reportWebVitals from "./reportWebVitals.ts"
import { UserAccount } from "./schema.ts"
import { JazzProvider } from "./components/provider/JazzProvider.tsx"
import { ThemeProvider } from "./components/provider/ThemeProvider.tsx"
import { PrivacyProvider } from "./components/provider/PrivacyProvider.tsx"

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { account: null },
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

function RouterWithContext() {
  const { me: account } = useAccount(UserAccount)

  return (
    <ThemeProvider defaultTheme="system">
      <PrivacyProvider>
        <RouterProvider router={router} context={{ account }} />
      </PrivacyProvider>
    </ThemeProvider>
  )
}

// Render the app
const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <JazzProvider>
        <RouterWithContext />
      </JazzProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
