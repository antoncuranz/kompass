import { JazzProvider } from "@/components/provider/JazzProvider.tsx"
import { PrivacyProvider } from "@/components/provider/PrivacyProvider.tsx"
import { ThemeProvider } from "@/components/provider/ThemeProvider.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"
import type { Metadata, Viewport } from "next"
import "../index.css"

export const metadata: Metadata = {
  title: "kompass",
  appleWebApp: {
    title: "kompass",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  themeColor: "white",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <div className="root">
          <JazzProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <PrivacyProvider>{children}</PrivacyProvider>
            </ThemeProvider>
          </JazzProvider>
          <Toaster />
        </div>
        <script>{`
        function updateThemeColor() {
          const meta = document.querySelector("meta[name=theme-color]")
          if (!meta) return
          const bg = document.querySelector("html").classList.contains("dark") ? "black" : "white"
          meta.setAttribute("content", bg)
        }
        updateThemeColor()
        const observer = new MutationObserver(mutations => {
          for (const m of mutations) {
            if (m.type === "attributes" && m.attributeName === "class") {
              updateThemeColor()
            }
          }
        })
        observer.observe(document.documentElement, { attributes: true })
      `}</script>
      </body>
    </html>
  )
}
