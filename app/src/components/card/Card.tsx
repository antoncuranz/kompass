import React from "react"
import type { MouseEventHandler } from "react"
import { cn } from "@/lib/utils.ts"

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
        "h-full w-full bg-background rounded-3xl shadow-xl shadow-black/10 dark:shadow-white/5 border no-scrollbar overflow-hidden overflow-y-scroll not-sm:rounded-none not-sm:shadow-none",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
