import React from "react"
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native"
import { useCoState } from "jazz-tools/expo"
import { SharedTrip, Trip } from "../schema"

interface ShareScreenProps {
  tripId: string
}

interface MemberItem {
  id: string
  name: string
  role: string
}

function getProfileName(account: unknown): string {
  if (!account || typeof account !== "object") return "Unknown"
  const acc = account as { $isLoaded?: boolean; profile?: { name?: string } }
  if (!acc.$isLoaded) return "Loading..."
  return acc.profile?.name ?? "Unknown"
}

function MemberRow({ member }: { member: MemberItem }) {
  return (
    <View className="flex-row items-center bg-white rounded-xl p-4 mb-2">
      <View className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3">
        <Text className="text-white font-semibold text-lg">
          {member.name?.charAt(0).toUpperCase() || "?"}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">
          {member.name || "Unknown"}
        </Text>
        <Text className="text-sm text-muted-foreground capitalize">
          {member.role}
        </Text>
      </View>
    </View>
  )
}

export default function ShareScreen({ tripId }: ShareScreenProps) {
  const sharedTrip = useCoState(SharedTrip, tripId, {
    resolve: {
      trip: Trip.resolveQuery,
      admins: true,
      members: true,
    },
  })

  const handleShare = async () => {
    try {
      const shareUrl = `https://kompass.app/join/${tripId}`
      await Share.share({
        message: `Join my trip on kompass! ${shareUrl}`,
        url: shareUrl,
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share trip")
    }
  }

  if (!sharedTrip?.$isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-muted">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-muted-foreground">Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const admins = sharedTrip.admins?.getDirectMembers() ?? []
  const members = sharedTrip.members?.getDirectMembers() ?? []

  const allMembers: Array<MemberItem> = [
    ...admins.map(admin => ({
      id: admin.id,
      name: getProfileName(admin.account),
      role: "Admin",
    })),
    ...members
      .filter(member => !admins.some(admin => admin.id === member.id))
      .map(member => ({
        id: member.id,
        name: getProfileName(member.account),
        role: member.role ?? "Member",
      })),
  ]

  const pendingRequests = Object.values(sharedTrip.requests ?? {}).filter(
    req => req.status === "pending",
  )

  return (
    <SafeAreaView className="flex-1 bg-muted">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-foreground">Share Trip</Text>
          <TouchableOpacity
            className="bg-primary px-4 py-2 rounded-xl"
            onPress={handleShare}
          >
            <Text className="text-white font-semibold">Share 🔗</Text>
          </TouchableOpacity>
        </View>

        {pendingRequests.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Pending Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.map(request => {
              const reqName = getProfileName(request.account)
              return (
                <View
                  key={request.$jazz.id}
                  className="flex-row items-center bg-yellow-50 rounded-xl p-4 mb-2 border border-yellow-200"
                >
                  <View className="w-10 h-10 bg-yellow-500 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-semibold text-lg">
                      {reqName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">
                      {reqName}
                    </Text>
                    <Text className="text-sm text-yellow-600">
                      Pending approval
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        <Text className="text-lg font-semibold text-foreground mb-3">
          Members ({allMembers.length})
        </Text>

        <FlatList
          data={allMembers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MemberRow member={item} />}
          ListEmptyComponent={() => (
            <View className="items-center py-8">
              <Text className="text-muted-foreground">No members yet</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </SafeAreaView>
  )
}
