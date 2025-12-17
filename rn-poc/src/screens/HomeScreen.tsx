import React from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useAccount } from "jazz-tools/expo"
import type { co } from "jazz-tools"
import { UserAccount, SharedTrip } from "../schema"
import { RootStackParamList } from "../navigation/RootNavigator"
import TripCard from "../components/TripCard"

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

function dateFromString(dateString: string): Date {
  return new Date(dateString + "T00:00:00")
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>()
  const account = useAccount(UserAccount)

  if (!account.$isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const sortedTrips = Object.values(account.root.tripMap).sort(
    (a: co.loaded<typeof SharedTrip>, b: co.loaded<typeof SharedTrip>) => {
      return (
        dateFromString(b.trip.startDate).getTime() -
        dateFromString(a.trip.startDate).getTime()
      )
    },
  )

  const fallbackColors = ["#0081A7", "#459f00", "#FED9B7", "#F07167"]

  const handleTripPress = (tripId: string) => {
    navigation.navigate("Trip", { tripId })
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-foreground">🧭 kompass</Text>
          <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
            <Text className="text-white font-semibold">
              {account.profile.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-semibold text-foreground">
          Hello {account.profile.name}! 👋
        </Text>
        <Text className="text-lg text-muted-foreground mt-1">
          Let's plan your trips
        </Text>
      </View>

      <FlatList
        data={sortedTrips}
        keyExtractor={item => item.$jazz.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-6xl mb-4">✈️</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">
              No trips yet
            </Text>
            <Text className="text-muted-foreground text-center px-8">
              Create a trip on the web app to see it here!
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <TripCard
            sharedTrip={item}
            fallbackColor={fallbackColors[index % fallbackColors.length]}
            onPress={() => handleTripPress(item.$jazz.id)}
          />
        )}
      />
    </SafeAreaView>
  )
}
