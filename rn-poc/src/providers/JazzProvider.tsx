import React from "react"
import { JazzExpoProvider } from "jazz-tools/expo"
import { UserAccount } from "../schema"
import { RNCrypto } from "jazz-tools/react-native-core/crypto/RNCrypto"
import wordlist from "../lib/wordlist"

const SYNC_URL = "ws://127.0.0.1:4200"

interface AppJazzProviderProps {
  children: React.ReactNode
}

export function AppJazzProvider({ children }: AppJazzProviderProps) {
  return (
    <JazzExpoProvider
      sync={{
        peer: SYNC_URL,
        when: "signedUp",
      }}
      AccountSchema={UserAccount}
      CryptoProvider={RNCrypto}
    >
      {children}
    </JazzExpoProvider>
  )
}

export { wordlist }
