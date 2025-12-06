import React from "react"
import { cn } from "@/lib/utils"

export default function TwoCardLayout({
  leftCard,
  rightCard,
  primaryCard = "left",
}: {
  leftCard: React.ReactNode
  rightCard: React.ReactNode
  primaryCard?: "left" | "right"
}) {
  const hiddenClasses = "hidden lg:block"

  return (
    <div className="flex h-full gap-4 [&>*]:empty:hidden">
      <div
        className={cn(
          "flex-1 lg:max-w-3xl lg:min-w-152 min-w-0",
          primaryCard === "right" && hiddenClasses,
        )}
      >
        {leftCard}
      </div>

      <div className={cn("flex-1 min-w-0", primaryCard === "left" && hiddenClasses)}>
        {rightCard}
      </div>
    </div>
  )
}
