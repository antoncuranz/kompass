import React from "react"
import { cn } from "@/lib/utils"

export default function Pane({
  title,
  subtitle,
  children,
  headerSlot,
  className,
  testId,
}: {
  title?: string
  subtitle?: string
  children: React.ReactNode
  headerSlot?: React.ReactNode
  className?: string
  testId?: string
}) {
  return (
    <div
      data-testid={testId}
      className={cn("h-full w-full sm:p-2 bg-background", className)}
    >
      <div className="flex flex-col h-full">
        {(title || headerSlot) && (
          <div className="flex flex-row p-3 pb-4 border-b not-sm:hidden">
            <div className="grow text-xl/[2rem] sm:text-2xl">
              <span className="mr-2">{title}</span>
              <span>{subtitle}</span>
            </div>
            {headerSlot}
          </div>
        )}
        <div className="h-full no-scrollbar overflow-hidden overflow-y-scroll">
          {children}
        </div>
      </div>
    </div>
  )
}
