import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { GalleryHorizontalEnd } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import { useAccount } from "jazz-tools/expo"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "~/navigation/RootNavigator"
import { Avatar } from "~/components/Avatar"
import { UserAccount } from "~/schema"

interface TripHeaderProps {
  tripName: string
}

export default function TripHeader({ tripName }: TripHeaderProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const account = useAccount(UserAccount)

  return (
    <View className="flex-row items-center px-3 pt-2 pb-2 bg-muted">
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        className="p-2 rounded-xl border border-border bg-transparent"
      >
        <GalleryHorizontalEnd size={18} color="#0a0a0a" />
      </TouchableOpacity>
      <Text
        className="flex-1 ml-2 text-base text-foreground leading-9"
        numberOfLines={1}
      >
        {tripName}
      </Text>
      {account?.$isLoaded && <Avatar accountId={account.$jazz.id} />}
    </View>
  )
}
