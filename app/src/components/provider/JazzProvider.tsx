import { JazzInspector } from "jazz-tools/inspector"
import { JazzReactProvider } from "jazz-tools/react"
import { Auth } from "@/components/Auth.tsx"
import { UserAccount } from "@/schema"

export function JazzProvider({ children }: { children: React.ReactNode }) {
  return (
    <JazzReactProvider
      sync={{
        peer: "ws://127.0.0.1:4200",
      }}
      guestMode={false}
      AccountSchema={UserAccount}
    >
      <JazzInspector />
      <Auth />
      {children}
    </JazzReactProvider>
  )
}
