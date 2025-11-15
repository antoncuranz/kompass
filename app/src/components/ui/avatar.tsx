import { Image } from "jazz-tools/react"
import { cn } from "@/lib/utils"

export function Avatar({
  imageId,
  name,
  className,
}: {
  imageId?: string
  name?: string
  className?: string
}) {
  const getInitials = (name?: string) => {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-muted overflow-hidden h-8 w-8 text-xs",
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
