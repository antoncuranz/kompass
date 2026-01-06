import type {
  Accommodation,
  Activity,
  FileAttachment,
  Transportation,
  Trip,
  User,
} from "@/domain"
import { useTripRepository } from "@/repo/trip/repository"
import { useActivityRepository } from "@/repo/activity/repository"
import { useAccommodationRepository } from "@/repo/accommodation/repository"
import { useTransportationRepository } from "@/repo/transportation/repository"
import { useAttachmentRepository } from "@/repo/attachment/repository"

export interface ExportedTrip extends Trip {
  activities: Array<Activity>
  accommodation: Array<Accommodation>
  transportation: Array<Transportation>
  files: Array<FileAttachment>
}

export interface ExportData {
  type: "kompass"
  version: 1
  exportedAt: string
  user: User
  trips: Array<ExportedTrip>
}

export async function exportUserData(user: User): Promise<ExportData> {
  const tripRepository = useTripRepository()
  const trips = await tripRepository.loadAll()

  const exportedTrips = await Promise.all(
    trips.map(async (trip): Promise<ExportedTrip> => {
      const activityRepo = useActivityRepository(trip.stid)
      const accommodationRepo = useAccommodationRepository(trip.stid)
      const transportationRepo = useTransportationRepository(trip.stid)
      const attachmentRepo = useAttachmentRepository(trip.stid)

      return {
        ...trip,
        activities: await activityRepo.loadAll(),
        accommodation: await accommodationRepo.loadAll(),
        transportation: await transportationRepo.loadAll(),
        files: await attachmentRepo.loadAll(),
      }
    }),
  )

  return {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    user,
    trips: exportedTrips,
  }
}
