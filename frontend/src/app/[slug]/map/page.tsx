import MapCard from "@/components/card/MapCard.tsx"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const tripId = (await params).slug

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] sm:min-h-[calc(100dvh-4.5rem)] gap-4">
      <MapCard tripId={tripId} />
    </div>
  )
}
