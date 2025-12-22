import React from "react"
import type { MouseEventHandler } from "react"
import { cn } from "@/lib/utils"

export default function Card({
  children,
  className,
  onClick,
  testId,
}: {
  children: React.ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  testId?: string
}) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "h-full w-full bg-card rounded-2xl shadow-xl border no-scrollbar overflow-hidden overflow-y-scroll",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
