import { JazzReactProvider } from "jazz-tools/react"
import { UserAccount } from "@/repo/user/schema"
import config from "@/config"

export function JazzProvider({ children }: { children: React.ReactNode }) {
  return (
    <JazzReactProvider
      sync={{
        peer: config.JAZZ_SYNC_URL,
        when: "signedUp",
      }}
      guestMode={false}
      AccountSchema={UserAccount}
    >
      {children}
    </JazzReactProvider>
  )
}
