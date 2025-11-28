import { createFileRoute } from "@tanstack/react-router"
import type { co } from "jazz-tools"
import type { SharedTrip } from "@/schema.ts"
import Card from "@/components/card/Card.tsx"
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
  const members = sharedTrip.members.getDirectMembers()

  return (
    <Card
      title="Share Trip"
      headerSlot={<ShareButton sharedTripId={sharedTrip.$jazz.id} />}
      testId="share-card"
    >
      <RequestTable
        title="Pending Requests"
        requests={pendingRequests}
        sharedTrip={sharedTrip}
      />
      <MemberTable
        title="Admins"
        members={admins.map(admin => ({
          id: admin.id,
          account: admin.account,
          role: admin.role,
        }))}
      />
      <MemberTable
        title="Members"
        members={members.map(member => ({
          id: member.id,
          account: member.account,
          role: member.role,
        }))}
      />
    </Card>
  )
}


