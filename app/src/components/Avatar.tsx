import { Image } from "jazz-tools/react"
import { cn } from "@/lib/utils"
import { isLoaded } from "@/domain"
import { useUserRepo } from "@/repo/userRepo"

export function Avatar({ className }: { className?: string }) {
  const { user } = useUserRepo()

  if (!isLoaded(user)) return null

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
      {user.avatarImageId ? (
        <Image
          imageId={user.avatarImageId}
          alt={user.name || "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-medium text-muted-foreground">
          {getInitials(user.name)}
        </span>
      )}
    </div>
  )
}
