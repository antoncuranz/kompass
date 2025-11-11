import { JazzReactProvider } from "jazz-tools/react"
import { UserAccount } from "@/schema"

export function JazzProvider({ children }: { children: React.ReactNode }) {
  const syncUrl = import.meta.env.VITE_JAZZ_SYNC_URL

  return (
    <JazzReactProvider
      sync={{
        peer: syncUrl ?? "ws://127.0.0.1:4200",
        when: "signedUp",
      }}
      guestMode={false}
      AccountSchema={UserAccount}
    >
      {children}
    </JazzReactProvider>
  )
}
