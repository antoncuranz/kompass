import {
  BlockHandleDraggable,
  BlockHandlePopover,
} from "@prosekit/react/block-handle"
import { GripVerticalIcon } from "lucide-react"

export function BlockHandle() {
  return (
    <BlockHandlePopover className="flex items-center gap-1 ml-1">
      <BlockHandleDraggable className="rounded cursor-grab active:cursor-grabbing">
        <GripVerticalIcon className="w-4 h-4 text-muted-foreground" />
      </BlockHandleDraggable>
    </BlockHandlePopover>
  )
}
