import { cn } from "@/lib/utils.ts"
import React, { MouseEventHandler } from "react"

export default function Card({
  title,
  subtitle,
  children,
  headerSlot,
  className,
  onClick,
  onSmallDevices = false,
}: {
  title?: string
  subtitle?: string
  children: React.ReactNode
  headerSlot?: React.ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  onSmallDevices?: boolean
}) {
  return (
    <div
      className={cn(
        "w-full bg-background rounded-3xl shadow-xl shadow-black/10 dark:shadow-white/5",
        !onSmallDevices && "not-sm:rounded-none not-sm:shadow-none",
        className,
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex flex-col h-full p-2 rounded-3xl border",
          !onSmallDevices &&
            "not-sm:p-0 not-sm:rounded-none not-sm:border-none",
        )}
      >
        {(title || headerSlot) && (
          <div
            className={cn(
              "flex flex-row p-3 pb-4 border-b",
              !onSmallDevices && "not-sm:hidden",
            )}
          >
            <div className="grow text-xl/[2rem] sm:text-2xl">
              <span className="mr-2">{title}</span>
              <span>{subtitle}</span>
            </div>
            {headerSlot}
          </div>
        )}
        <div
          className={cn(
            "h-full rounded-2xl no-scrollbar overflow-hidden overflow-y-scroll",
            !onSmallDevices && "not-sm:rounded-none",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
