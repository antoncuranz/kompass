import { createJazzPlugin } from "jazz-tools/prosemirror"
import { defineBasicExtension } from "prosekit/basic"
import { definePlugin, union } from "prosekit/core"
import { definePlaceholder } from "prosekit/extensions/placeholder"
import { defineReadonly } from "prosekit/extensions/readonly"
import { defineDropIndicator } from "prosekit/extensions/drop-indicator"
import type { CoRichText } from "jazz-tools"

export function defineExtension({
  richText,
  readOnly,
}: {
  richText: CoRichText
  readOnly?: boolean
}) {
  const extensions = [
    defineBasicExtension(),
    definePlaceholder({
      placeholder: "Add trip notes, ideas, or reminders...",
    }),
    definePlugin(createJazzPlugin(richText)),
    defineDropIndicator(),
  ] as const

  if (readOnly) {
    return union(defineReadonly(), ...extensions)
  } else {
    return union(...extensions)
  }
}

export type EditorExtension = ReturnType<typeof defineExtension>
