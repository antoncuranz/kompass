import React, { createContext, useContext, useState } from "react"

type PrivacyContextType = {
  privacyMode: boolean
  togglePrivacyMode: () => void
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(() => {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem("privacy-mode")
    return stored === "true"
  })

  const togglePrivacyMode = () => {
    setPrivacyMode(prev => {
      const newValue = !prev
      localStorage.setItem("privacy-mode", String(newValue))
      return newValue
    })
  }

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (context === undefined) {
    throw new Error("usePrivacy must be used within PrivacyProvider")
  }
  return context
}
