"use client"

import Card from "@/components/card/Card.tsx"
import { cn } from "@/lib/utils.ts"
import { CirclePlus } from "lucide-react"

export default function NewTripCard({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Card
      key="new-trip"
      className={cn(
        "shadow-none hover:shadow-xl hover:cursor-pointer",
        className,
      )}
      onClick={onClick}
      onSmallDevices
    >
      <div className="h-full w-full rounded-2xl no-scrollbar overflow-hidden overflow-y-scroll flex items-center justify-center">
        <CirclePlus className="w-14 h-14 text-gray-400" />
      </div>
    </Card>
  )
}
