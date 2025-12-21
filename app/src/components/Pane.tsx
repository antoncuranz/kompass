import React from "react"
import { cn } from "@/lib/utils"

export default function Pane({
  children,
  leftSlot,
  title,
  rightSlot,
  className,
  testId,
}: {
  children: React.ReactNode
  leftSlot?: React.ReactNode
  title?: string
  rightSlot?: React.ReactNode
  className?: string
  testId?: string
}) {
  return (
    <div
      data-testid={testId}
      className={cn("h-full w-full bg-card", className)}
    >
      <div className="relative flex flex-col h-full">
        {(leftSlot || title || rightSlot) && (
          <div className="absolute top-0 left-0 right-0 z-20 not-sm:hidden">
            <div className="pane-header-blur" />
            <div className="relative flex flex-row p-2 gap-2">
              {leftSlot}
              <h2 className="grow text-lg font-semibold leading-10">{title}</h2>
              {rightSlot}
            </div>
          </div>
        )}
        <div
          className={cn(
            "h-full no-scrollbar overflow-hidden overflow-y-scroll",
            (leftSlot || title || rightSlot) && "sm:pt-14",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
