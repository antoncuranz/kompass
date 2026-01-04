import { createFileRoute } from "@tanstack/react-router"
import Pane from "@/components/Pane.tsx"
import ShareButton from "@/components/buttons/ShareButton"
import MemberTable from "@/components/collaboration/MemberTable.tsx"
import RequestTable from "@/components/collaboration/RequestTable.tsx"
import { useTrip } from "@/components/provider/TripProvider"
import { isLoaded } from "@/domain"
import { useSingleTripRepo } from "@/repo"

export const Route = createFileRoute("/$trip/share")({
  component: SharePage,
})

function SharePage() {
  const trip = useTrip()
  const { meta: tripMeta } = useSingleTripRepo(trip.stid)
  if (!isLoaded(tripMeta)) return null

  const pendingRequests = Object.values(tripMeta.joinRequests).filter(
    req => req.status === "pending",
  )

  const allMembers = [
    ...tripMeta.admins.map(member => ({
      id: member.id,
      name: member.name,
      role: "Admin",
    })),
    ...tripMeta.members.map(member => ({
      id: member.id,
      name: member.name,
      role: "Member",
    })),
    ...tripMeta.guests.map(member => ({
      id: member.id,
      name: member.name,
      role: "Guest",
    })),
  ]

  return (
    <Pane
      title="Share Trip"
      rightSlot={<ShareButton stid={trip.stid} />}
      testId="share-card"
    >
      <RequestTable
        title="Pending Requests"
        joinRequests={pendingRequests}
        stid={trip.stid}
      />
      <MemberTable title="Members" members={allMembers} />
    </Pane>
  )
}
