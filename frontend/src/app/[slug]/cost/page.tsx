import ItineraryCard from "@/components/card/ItineraryCard.tsx"

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const tripId = (await params).slug

  return (
    <div className="flex h-full gap-4">
      <ItineraryCard tripId={tripId} />
    </div>
  )
}
