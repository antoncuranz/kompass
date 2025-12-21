import { useEditor } from "prosekit/react"
import { InlinePopover } from "prosekit/react/inline-popover"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SourceCodeIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "@hugeicons/core-free-icons"
import type { EditorExtension } from "./extension"

export function InlineMenu() {
  const editor = useEditor<EditorExtension>({ update: true })

  const toggleBold = () => editor.commands.toggleBold()
  const toggleItalic = () => editor.commands.toggleItalic()
  const toggleUnderline = () => editor.commands.toggleUnderline()
  const toggleStrike = () => editor.commands.toggleStrike()
  const toggleCode = () => editor.commands.toggleCode()

  const isBold = editor.marks.bold.isActive()
  const isItalic = editor.marks.italic.isActive()
  const isUnderline = editor.marks.underline.isActive()
  const isStrike = editor.marks.strike.isActive()
  const isCode = editor.marks.code.isActive()

  return (
    <InlinePopover className="flex items-center gap-1 p-1 bg-popover text-popover-foreground rounded-md border-0 dark:border shadow-lg shadow-black/10 dark:shadow-white/5">
      <button
        onClick={toggleBold}
        className={`p-2 rounded cursor-pointer hover:bg-muted hover:text-muted-foreground ${isBold ? "bg-accent text-accent-foreground" : ""}`}
        aria-label="Bold"
      >
        <HugeiconsIcon icon={TextBoldIcon} />
      </button>
      <button
        onClick={toggleItalic}
        className={`p-2 rounded cursor-pointer hover:bg-muted hover:text-muted-foreground ${isItalic ? "bg-accent text-accent-foreground" : ""}`}
        aria-label="Italic"
      >
        <HugeiconsIcon icon={TextItalicIcon} />
      </button>
      <button
        onClick={toggleUnderline}
        className={`p-2 rounded cursor-pointer hover:bg-muted hover:text-muted-foreground ${isUnderline ? "bg-accent text-accent-foreground" : ""}`}
        aria-label="Underline"
      >
        <HugeiconsIcon icon={TextUnderlineIcon} />
      </button>
      <button
        onClick={toggleStrike}
        className={`p-2 rounded cursor-pointer hover:bg-muted hover:text-muted-foreground ${isStrike ? "bg-accent text-accent-foreground" : ""}`}
        aria-label="Strikethrough"
      >
        <HugeiconsIcon icon={TextStrikethroughIcon} />
      </button>
      <button
        onClick={toggleCode}
        className={`p-2 rounded cursor-pointer hover:bg-muted hover:text-muted-foreground ${isCode ? "bg-accent text-accent-foreground" : ""}`}
        aria-label="Code"
      >
        <HugeiconsIcon icon={SourceCodeIcon} />
      </button>
    </InlinePopover>
  )
}
