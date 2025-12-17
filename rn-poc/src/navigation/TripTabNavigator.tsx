import React from "react"
import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useCoState } from "jazz-tools/expo"
import type { RootStackParamList } from "./RootNavigator"
import { SharedTrip, Trip } from "~/schema"
import TripHeader from "~/components/TripHeader"
import ItineraryScreen from "~/screens/ItineraryScreen"
import ShareScreen from "~/screens/ShareScreen"
import { cn } from "~/lib/utils"

export type TripTabParamList = {
  Itinerary: undefined
  Notes: undefined
  Cost: undefined
  Files: undefined
  Map: undefined
  Share: undefined
}

// Placeholder screens for features not yet implemented
function NotesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg text-muted-foreground">Notes - Coming Soon</Text>
    </View>
  )
}

function CostScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg text-muted-foreground">Cost - Coming Soon</Text>
    </View>
  )
}

function FilesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg text-muted-foreground">Files - Coming Soon</Text>
    </View>
  )
}

function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg text-muted-foreground">Map - Coming Soon</Text>
    </View>
  )
}

const tabs = ["Itinerary", "Notes", "Cost", "Files", "Map", "Share"] as const
type TabName = (typeof tabs)[number]

interface TabBarProps {
  activeTab: TabName
  onTabPress: (tab: TabName) => void
  showShare: boolean
}

function TabBar({ activeTab, onTabPress, showShare }: TabBarProps) {
  const visibleTabs = showShare ? tabs : tabs.filter(t => t !== "Share")

  return (
    <View className="border-b border-border bg-muted">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 40 }}
      >
        <View className="flex-row" style={{ gap: 24 }}>
          {visibleTabs.map(tab => {
            const isActive = activeTab === tab
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => onTabPress(tab)}
                style={{ paddingTop: 8 }}
              >
                <View
                  style={{
                    paddingBottom: 8,
                    borderBottomWidth: isActive ? 3 : 0,
                    borderBottomColor: isActive ? "#D2691E" : "transparent",
                    marginBottom: -1,
                  }}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {tab}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

type Props = NativeStackScreenProps<RootStackParamList, "Trip">

export default function TripTabNavigator({ route }: Props) {
  const { tripId } = route.params
  const [activeTab, setActiveTab] = React.useState<TabName>("Itinerary")

  const sharedTrip = useCoState(SharedTrip, tripId, {
    resolve: {
      trip: Trip.resolveQuery,
      admins: true,
    },
  })

  const tripName =
    sharedTrip?.$isLoaded && sharedTrip.trip?.$isLoaded
      ? sharedTrip.trip.name
      : "Loading..."

  const isAdmin =
    sharedTrip?.$isLoaded && sharedTrip.admins?.myRole?.() === "admin"

  function renderScreen() {
    switch (activeTab) {
      case "Itinerary":
        return <ItineraryScreen tripId={tripId} />
      case "Share":
        return <ShareScreen tripId={tripId} />
      case "Notes":
        return <NotesScreen />
      case "Cost":
        return <CostScreen />
      case "Files":
        return <FilesScreen />
      case "Map":
        return <MapScreen />
    }
  }

  return (
    <View className="flex-1 bg-muted">
      <SafeAreaView className="bg-muted" />
      <TripHeader tripName={tripName} />
      <TabBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
        showShare={isAdmin}
      />
      <View className="flex-1 bg-background">{renderScreen()}</View>
    </View>
  )
}
