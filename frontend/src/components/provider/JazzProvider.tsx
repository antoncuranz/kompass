"use client"

import { Auth } from "@/components/Auth.tsx"
import { JazzAccount } from "@/schema"
import { JazzInspector } from "jazz-tools/inspector"
import { JazzReactProvider } from "jazz-tools/react"

export function JazzProvider({ children }: { children: React.ReactNode }) {
  return (
    <JazzReactProvider
      sync={{
        peer: "ws://127.0.0.1:4200",
      }}
      guestMode={false}
      AccountSchema={JazzAccount}
    >
      <JazzInspector />
      <Auth />
      {children}
    </JazzReactProvider>
  )
}
