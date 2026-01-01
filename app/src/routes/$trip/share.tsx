import { createFileRoute } from "@tanstack/react-router"
import Pane from "@/components/Pane.tsx"
import ShareButton from "@/components/buttons/ShareButton"
import MemberTable from "@/components/collaboration/MemberTable.tsx"
import RequestTable from "@/components/collaboration/RequestTable.tsx"
import { useSharedTrip } from "@/components/provider/TripProvider"

export const Route = createFileRoute("/$trip/share")({
  component: SharePage,
})

function SharePage() {
  const sharedTrip = useSharedTrip()

  const pendingRequests = Object.values(sharedTrip.requests).filter(
    req => req.status === "pending",
  )

  const admins = sharedTrip.admins.getDirectMembers()
  const members = sharedTrip.members
    .getDirectMembers()
    .filter(member => member.role !== "admin")
  const guests = sharedTrip.guests
    .getDirectMembers()
    .filter(member => member.role !== "admin")

  const allMembers = [
    ...admins.map(admin => ({
      id: admin.id,
      account: admin.account,
      role: "Admin",
    })),
    ...members.map(member => ({
      id: member.id,
      account: member.account,
      role: "Member",
    })),
    ...guests.map(member => ({
      id: member.id,
      account: member.account,
      role: "Guest",
    })),
  ]

  return (
    <Pane
      title="Share Trip"
      rightSlot={<ShareButton sharedTripId={sharedTrip.$jazz.id} />}
      testId="share-card"
    >
      <RequestTable
        title="Pending Requests"
        requests={pendingRequests}
        sharedTrip={sharedTrip}
      />
      <MemberTable title="Members" members={allMembers} />
    </Pane>
  )
}
