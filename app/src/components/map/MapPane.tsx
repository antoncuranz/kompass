import Pane from "@/components/Pane.tsx"
import HeroMap from "@/components/map/HeroMap.tsx"
import { cn } from "@/lib/utils"

export default function MapPane({ className }: { className?: string }) {
  return (
    <Pane className={cn("sm:p-0", className)}>
      <HeroMap />
    </Pane>
  )
}
