import JSZip from "jszip"
import { co } from "jazz-tools"
import type {
  Accommodation,
  Activity,
  FileAttachment,
  Transportation,
  Trip,
} from "@/domain"
import { User } from "@/domain"
import { useTripRepository } from "@/repo/trip/repository"
import { FileAttachmentEntity } from "@/repo/attachment/schema"
import { SharedTripEntity } from "@/repo/trip/schema"
import { mapAttachment } from "@/repo/attachment/mappers"

export type ExportedTrip = Trip & {
  activities: Array<Activity>
  accommodation: Array<Accommodation>
  transportation: Array<Transportation>
  files: Array<FileAttachment>
}

export type ExportData = {
  type: "kompass"
  version: 1
  exportedAt: string
  user: User
  trips: Array<ExportedTrip>
}

type FileWithBlob = {
  tripId: string
  attachment: FileAttachment
  blob: Blob
}

async function loadTripWithBlobs(trip: Trip): Promise<{
  exportedTrip: ExportedTrip
  blobs: Array<FileWithBlob>
}> {
  const activityRepo = (await import("@/repo/activity/repository")).useActivityRepository(trip.stid)
  const accommodationRepo = (await import("@/repo/accommodation/repository")).useAccommodationRepository(trip.stid)
  const transportationRepo = (await import("@/repo/transportation/repository")).useTransportationRepository(trip.stid)

  const sharedTrip = await SharedTripEntity.load(trip.stid, {
    resolve: {
      trip: { files: { $each: { ...FileAttachmentEntity.resolveQuery, file: true } } },
    },
  })

  if (!sharedTrip.$isLoaded) {
    throw new Error(`Failed to load trip ${trip.stid}`)
  }

  const files = [...sharedTrip.trip.files]
  const blobs: Array<FileWithBlob> = []

  for (const entity of files) {
    const attachment = mapAttachment(entity)
    const blob = await co.fileStream().loadAsBlob(entity.file.$jazz.id)
    if (blob) {
      blobs.push({ tripId: trip.stid, attachment, blob })
    }
  }

  return {
    exportedTrip: {
      ...trip,
      activities: await activityRepo.loadAll(),
      accommodation: await accommodationRepo.loadAll(),
      transportation: await transportationRepo.loadAll(),
      files: files.map(mapAttachment),
    },
    blobs,
  }
}

export async function exportUserData(user: User): Promise<ExportData> {
  const tripRepository = useTripRepository()
  const trips = await tripRepository.loadAll()

  const results = await Promise.all(trips.map(loadTripWithBlobs))

  return {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    user: User.parse(user),
    trips: results.map(r => r.exportedTrip),
  }
}

export async function exportToZip(user: User): Promise<Blob> {
  const tripRepository = useTripRepository()
  const trips = await tripRepository.loadAll()

  const results = await Promise.all(trips.map(loadTripWithBlobs))

  const exportData: ExportData = {
    type: "kompass",
    version: 1,
    exportedAt: new Date().toISOString(),
    user: User.parse(user),
    trips: results.map(r => r.exportedTrip),
  }

  const zip = new JSZip()

  zip.file("data.json", JSON.stringify(exportData, null, 2))

  for (const { blobs } of results) {
    for (const { tripId, attachment, blob } of blobs) {
      zip.file(`files/${tripId}/${attachment.id}-${attachment.name}`, blob)
    }
  }

  return await zip.generateAsync({ type: "blob" })
}
