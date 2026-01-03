import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import type { CoRichText } from "jazz-tools"
import Pane from "@/components/Pane.tsx"
import NotesEditor from "@/components/notes/NotesEditor.tsx"
import { useTrip } from "@/components/provider/TripProvider"

export const Route = createFileRoute("/$trip/notes")({
  component: NotesPage,
})

function NotesPage() {
  const trip = useTrip()

  const memoRichText: CoRichText = useMemo(() => {
    return trip.notes
  }, [trip.notes.$jazz.id])

  return (
    <Pane testId="notes-card">
      <NotesEditor richText={memoRichText} />
    </Pane>
  )
}
