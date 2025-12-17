import React, { createContext, useContext, useState } from "react"

type InspectorContextType = {
  showInspector: boolean
  toggleInspector: () => void
}

const InspectorContext = createContext<InspectorContextType | undefined>(
  undefined,
)

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [showInspector, setShowInspector] = useState(() => {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem("show-inspector")
    return stored === "true"
  })

  const toggleInspector = () => {
    setShowInspector(prev => {
      const newValue = !prev
      localStorage.setItem("show-inspector", String(newValue))
      return newValue
    })
  }

  return (
    <InspectorContext.Provider value={{ showInspector, toggleInspector }}>
      {children}
    </InspectorContext.Provider>
  )
}

export function useInspector() {
  const context = useContext(InspectorContext)
  if (context === undefined) {
    throw new Error("useInspector must be used within InspectorProvider")
  }
  return context
}
