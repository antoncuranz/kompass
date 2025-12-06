import { createFileRoute } from "@tanstack/react-router"
import Card from "@/components/card/Card.tsx"

export const Route = createFileRoute("/$trip/files/$fileId")({
  component: FileDetailPage,
})

function FileDetailPage() {
  const { fileId } = Route.useParams()

  return (
    <Card title={`File: ${fileId}`} testId="file-detail-card">
      <div className="text-center text-muted-foreground py-8">
        File detail for {fileId}
      </div>
    </Card>
  )
}
