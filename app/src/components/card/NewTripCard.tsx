import { CirclePlus } from "lucide-react"
import Card from "@/components/card/Card.tsx"
import { cn } from "@/lib/utils.ts"

export default function NewTripCard({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  return (
    <Card
      testId="new-trip-card"
      className={cn(
        "shadow-none hover:shadow-xl hover:cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className="h-full w-full rounded-2xl no-scrollbar overflow-hidden overflow-y-scroll flex items-center justify-center">
        <CirclePlus className="w-14 h-14 text-gray-400" />
      </div>
    </Card>
  )
}
