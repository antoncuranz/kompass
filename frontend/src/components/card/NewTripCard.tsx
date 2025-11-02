"use client"

import Card from "@/components/card/Card.tsx"
import { Dialog } from "@/components/dialog/Dialog.tsx"
import TripDialogContent from "@/components/dialog/TripDialogContent.tsx"
import { cn } from "@/lib/utils.ts"
import { JazzAccount } from "@/schema"
import { CirclePlus } from "lucide-react"
import { useState } from "react"

export default function NewTripCard({
  account,
  className,
}: {
  account: JazzAccount
  className?: string
}) {
  const [tripDialogOpen, setTripDialogOpen] = useState(false)

  return (
    <>
      <Card
        key="new-trip"
        className={cn(
          "shadow-none hover:shadow-xl hover:cursor-pointer",
          className,
        )}
        onClick={() => setTripDialogOpen(true)}
        onSmallDevices
      >
        <div className="h-full w-full rounded-2xl no-scrollbar overflow-hidden overflow-y-scroll flex items-center justify-center">
          <CirclePlus className="w-14 h-14 text-gray-400" />
        </div>
      </Card>
      <Dialog open={tripDialogOpen} setOpen={setTripDialogOpen}>
        <TripDialogContent account={account} />
      </Dialog>
    </>
  )
}
