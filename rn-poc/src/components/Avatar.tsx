import React from "react"
import { View, Text } from "react-native"
import { useCoState } from "jazz-tools/expo"
import { UserAccount } from "~/schema"
import { cn } from "~/lib/utils"

interface AvatarProps {
  accountId?: string
  className?: string
}

function getInitials(name?: string): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({ accountId, className }: AvatarProps) {
  const account = useCoState(UserAccount, accountId, {
    resolve: { profile: true },
  })

  if (!account?.$isLoaded) return null

  const name = account.profile?.name

  return (
    <View
      className={cn(
        "items-center justify-center rounded-full bg-muted overflow-hidden h-8 w-8 border border-border",
        className,
      )}
    >
      <Text className="font-medium text-xs text-muted-foreground">
        {getInitials(name)}
      </Text>
    </View>
  )
}
