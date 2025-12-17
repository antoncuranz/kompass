import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Text, View } from "react-native"
import { RootStackParamList } from "./RootNavigator"
import ItineraryScreen from "../screens/ItineraryScreen"
import ShareScreen from "../screens/ShareScreen"

export type TripTabParamList = {
  Itinerary: undefined
  Share: undefined
  Notes: undefined
  Cost: undefined
  Map: undefined
}

const Tab = createBottomTabNavigator<TripTabParamList>()

// Placeholder screens for features not yet implemented
function NotesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg text-muted-foreground">Notes - Coming Soon</Text>
    </View>
  )
}

function CostScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg text-muted-foreground">Cost - Coming Soon</Text>
    </View>
  )
}

function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg text-muted-foreground">Map - Coming Soon</Text>
    </View>
  )
}

type Props = NativeStackScreenProps<RootStackParamList, "Trip">

export default function TripTabNavigator({ route }: Props) {
  const { tripId } = route.params

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#0081A7",
        tabBarInactiveTintColor: "#737373",
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#171717",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Itinerary"
        options={{
          tabBarLabel: "Itinerary",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📅</Text>
          ),
        }}
      >
        {() => <ItineraryScreen tripId={tripId} />}
      </Tab.Screen>
      <Tab.Screen
        name="Share"
        options={{
          tabBarLabel: "Share",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👥</Text>
          ),
        }}
      >
        {() => <ShareScreen tripId={tripId} />}
      </Tab.Screen>
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          tabBarLabel: "Notes",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Cost"
        component={CostScreen}
        options={{
          tabBarLabel: "Cost",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>💰</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🗺️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  )
}
