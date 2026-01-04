import { Group, co, z } from "jazz-tools"
import { ActivityEntity } from "@/repo/activity/schema"
import { AccommodationEntity } from "@/repo/accommodation/schema"
import { TransportationEntity } from "@/repo/transportation/schema"
import { FileAttachmentEntity } from "@/repo/attachment/schema"
import { JoinRequestEntity, JoinRequestStatus } from "@/repo/common/schema"

export const TripEntity = co
  .map({
    name: z.string(),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    activities: co.list(ActivityEntity),
    accommodation: co.list(AccommodationEntity),
    transportation: co.list(TransportationEntity),
    notes: co.richText(),
    files: co.list(FileAttachmentEntity),
  })
  // .withMigration(trip => {
  //   // consider making new attributes optional to prevent errors for users w/o write permissions
  //   if (!trip.$jazz.has("files")) {
  //     const files = co.list(FileAttachment).create([], {
  //       owner: trip.$jazz.owner,
  //       // IMPORTANT: prevents new attributes being overwritten during migrations of other clients
  //       unique: `files_${trip.$jazz.id}`,
  //     })
  //     trip.$jazz.set("files", files)
  //   }
  // })
  .resolved({
    activities: { $each: ActivityEntity.resolveQuery },
    accommodation: { $each: AccommodationEntity.resolveQuery },
    transportation: { $each: true },
    notes: true,
    files: { $each: FileAttachmentEntity.resolveQuery, $onError: "catch" },
  })

export const RequestStatuses = co
  .record(z.string(), JoinRequestStatus)
  .resolved({ $each: true })

export const JoinRequests = co
  .record(z.string(), JoinRequestEntity)
  .resolved({ $each: JoinRequestEntity.resolveQuery, $onError: "catch" })

export const SharedTripEntity = co.map({
  trip: TripEntity,
  requests: JoinRequests,
  statuses: RequestStatuses,
  admins: Group, // write-access to SharedTripEntity
  members: Group, // write-access to Trip
  guests: Group, // read-access to less sensitive Trip data
  workers: Group, // necessary access for server workers
})
