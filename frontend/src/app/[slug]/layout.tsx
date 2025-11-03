import Navigation from "@/components/navigation/Navigation.tsx"
import TripAccessGuard from "@/components/TripAccessGuard.tsx"

// export async function generateMetadata({
//   params
// } : {
//   params: Promise<{ slug: string }>
// }) {
//   // const tripId = (await params).slug
//   // const trip = await fetchTrip(tripId)
//
//   return {
//     title: "kompass - " // + trip.name
//   };
// }

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}) {
  const tripId = (await params).slug

  return (
    <>
      <Navigation tripId={tripId} />
      <main className="w-full sm:px-4 md:px-6 md:gap-2 relative z-1 sm:h-[calc(100dvh-4.5rem)]">
        <TripAccessGuard tripId={tripId}>{children}</TripAccessGuard>
      </main>
    </>
  )
}
