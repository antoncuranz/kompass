import "./global.css"
import React from "react"
import { StatusBar } from "expo-status-bar"
import { AppJazzProvider } from "./src/providers/JazzProvider"
import RootNavigator from "./src/navigation/RootNavigator"

export default function App() {
  return (
    <AppJazzProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppJazzProvider>
  )
}
