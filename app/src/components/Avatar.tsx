import { Image, useCoState } from "jazz-tools/react"
import { UserAccount } from "@/repo/jazzSchema"
import { cn } from "@/lib/utils"

export function Avatar({
  accountId,
  className,
}: {
  accountId?: string
  className?: string
}) {
  const account = useCoState(UserAccount, accountId, {
    resolve: { profile: true },
  })

  if (!account.$isLoaded) return null

  const imageId = account.profile.avatar?.$jazz.id
  const name = account.profile.name

  const getInitials = (name?: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-background overflow-hidden h-8 w-8 text-xs border",
        className,
      )}
    >
      {imageId ? (
        <Image
          imageId={imageId}
          alt={name || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-medium text-muted-foreground">
          {getInitials(name)}
        </span>
      )}
    </div>
  )
}
