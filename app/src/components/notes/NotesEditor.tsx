import { memo, useMemo } from "react"
import { createEditor } from "prosekit/core"
import { ProseKit } from "@prosekit/react"
import { DropIndicator } from "@prosekit/react/drop-indicator"
import { defineExtension } from "./extension"
import { BlockHandle } from "./BlockHandle"
import { InlineMenu } from "./InlineMenu"
import type { CoRichText } from "jazz-tools"
import { useUserRole } from "@/repo/userRepo"
import { useTrip } from "../provider/TripProvider"

function NotesEditor({ richText }: { richText: CoRichText }) {
  const trip = useTrip()
  const userRole = useUserRole(trip.stid)
  const readOnly = !userRole || userRole === "guest"

  const editor = useMemo(() => {
    const extension = defineExtension({ richText, readOnly })
    return createEditor({ extension })
  }, [richText, readOnly])

  return (
    <ProseKit editor={editor}>
      <div className="flex h-full min-h-[400px] flex-col">
        <div className="relative flex-1">
          <div
            ref={editor.mount}
            className="ProseMirror min-h-[400px] flex-1 overflow-y-auto rounded-md p-5 focus:outline-none"
            spellCheck={false}
          />
          {!readOnly && (
            <>
              <BlockHandle />
              <InlineMenu />
              <DropIndicator className="h-0.5 bg-blue-500" />
            </>
          )}
        </div>
      </div>
    </ProseKit>
  )
}

export default memo(NotesEditor)
