import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { MouseEventHandler } from "react"

export default function JumpToMapButton({
  onClick,
}: {
  onClick?: MouseEventHandler<SVGSVGElement> | undefined
}) {
  return (
    <HugeiconsIcon
      icon={ArrowRight01Icon}
      className="text-muted-foreground absolute top-0 size-6 h-10 -right-6 rounded-full hidden pointer-events-auto! group-hover/flyto:block"
      onClick={onClick}
    />
  )
}
