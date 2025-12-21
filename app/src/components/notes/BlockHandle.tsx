import {
  BlockHandleDraggable,
  BlockHandlePopover,
} from "@prosekit/react/block-handle"
import { HugeiconsIcon } from "@hugeicons/react"
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons"

export function BlockHandle() {
  return (
    <BlockHandlePopover className="flex items-center gap-1 ml-2">
      <BlockHandleDraggable className="rounded cursor-grab active:cursor-grabbing">
        <HugeiconsIcon
          icon={DragDropVerticalIcon}
          className="text-muted-foreground"
        />
      </BlockHandleDraggable>
    </BlockHandlePopover>
  )
}
