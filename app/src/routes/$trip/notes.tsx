import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { useAccount } from "jazz-tools/react-core"
import type { CoRichText } from "jazz-tools"
import Card from "@/components/card/Card.tsx"
import NotesEditor from "@/components/notes/NotesEditor.tsx"
import { useTrip } from "@/components/provider/TripProvider"

export const Route = createFileRoute("/$trip/notes")({
  component: NotesPage,
})

function NotesPage() {
  const trip = useTrip()
  const account = useAccount()

  const memoRichText: CoRichText = useMemo(() => {
    return trip.notes
  }, [trip.notes.$jazz.id, account.$jazz.id])

  return (
    <Card title="Trip Notes" testId="notes-card">
      <NotesEditor richText={memoRichText} />
    </Card>
  )
}
