import JSZip from "jszip"
import { toast } from "sonner"
import type { ExportedTrip } from "./export"
import { useTripRepository } from "@/repo/trip/repository"
import { useActivityRepository } from "@/repo/activity/repository"
import { useAccommodationRepository } from "@/repo/accommodation/repository"
import { useTransportationRepository } from "@/repo/transportation/repository"
import { useAttachmentRepository } from "@/repo/attachment/repository"
import { SharedTripEntity } from "@/repo/trip/schema"

type ImportResult = {
  imported: number
  errors: Array<string>
}

async function importTrip(
  exportedTrip: ExportedTrip,
  zip: JSZip,
  oldTripId: string,
): Promise<Array<string>> {
  const errors: Array<string> = []
  const idMap = new Map<string, string>()

  const tripRepo = useTripRepository()
  const newTrip = await tripRepo.create({
    name: exportedTrip.name,
    startDate: exportedTrip.startDate,
    endDate: exportedTrip.endDate,
    description: exportedTrip.description,
    imageUrl: exportedTrip.imageUrl,
  })

  const activityRepo = useActivityRepository(newTrip.stid)
  for (const activity of exportedTrip.activities) {
    const { id: oldId, ...values } = activity
    const newActivity = await activityRepo.create(values)
    idMap.set(oldId, newActivity.id)
  }

  const accommodationRepo = useAccommodationRepository(newTrip.stid)
  for (const accommodation of exportedTrip.accommodation) {
    const { id: oldId, ...values } = accommodation
    const newAccommodation = await accommodationRepo.create(values)
    idMap.set(oldId, newAccommodation.id)
  }

  const transportationRepo = useTransportationRepository(newTrip.stid)
  for (const transportation of exportedTrip.transportation) {
    const { id: oldId, ...rest } = transportation
    let newId: string

    switch (rest.type) {
      case "flight": {
        const { type: _, ...values } = rest
        const created = await transportationRepo.createFlight(values)
        newId = created.id
        break
      }
      case "train": {
        const { type: _, ...values } = rest
        const created = await transportationRepo.createTrain(values)
        newId = created.id
        break
      }
      case "generic": {
        const { type: _, ...values } = rest
        const created = await transportationRepo.createGeneric(values)
        newId = created.id
        break
      }
    }

    idMap.set(oldId, newId)
  }

  const attachmentRepo = useAttachmentRepository(newTrip.stid)
  for (const fileAttachment of exportedTrip.files) {
    const blobPath = `files/${oldTripId}/${fileAttachment.id}-${fileAttachment.name}`
    const zipFile = zip.file(blobPath)

    if (!zipFile) {
      errors.push(`Missing file: ${blobPath}`)
      continue
    }

    const blob = await zipFile.async("blob")
    const mappedReferences: Array<string> = []
    let unmappedCount = 0

    for (const oldRef of fileAttachment.references) {
      const newRef = idMap.get(oldRef)
      if (newRef) {
        mappedReferences.push(newRef)
      } else {
        unmappedCount++
      }
    }

    if (unmappedCount > 0) {
      toast.warning(`${unmappedCount} reference(s) not mapped for "${fileAttachment.name}"`)
    }

    await attachmentRepo.create({
      name: fileAttachment.name,
      file: new File([blob], fileAttachment.name),
      references: mappedReferences,
    })
  }

  const notesText = String(exportedTrip.notes)
  if (notesText) {
    const sharedTrip = await SharedTripEntity.load(newTrip.stid, {
      resolve: { trip: { notes: true } },
    })
    if (sharedTrip.$isLoaded) {
      sharedTrip.trip.notes.$jazz.applyDiff(notesText)
    }
  }

  return errors
}

export async function importFromZip(file: File): Promise<ImportResult> {
  const zip = await JSZip.loadAsync(file)

  const dataFile = zip.file("data.json")
  if (!dataFile) {
    return { imported: 0, errors: ["data.json not found in zip"] }
  }

  const dataJson = await dataFile.async("string")
  let exportData: unknown

  try {
    exportData = JSON.parse(dataJson)
  } catch {
    return { imported: 0, errors: ["Invalid JSON in data.json"] }
  }

  const parsed = exportData as { type?: string; version?: number; trips?: Array<ExportedTrip> }
  if (parsed.type !== "kompass" || parsed.version !== 1 || !Array.isArray(parsed.trips)) {
    return { imported: 0, errors: ["Invalid export format or version"] }
  }

  const allErrors: Array<string> = []
  let imported = 0

  for (const trip of parsed.trips) {
    try {
      const tripErrors = await importTrip(trip, zip, trip.stid)
      allErrors.push(...tripErrors)
      imported++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      allErrors.push(`Failed to import "${trip.name}": ${message}`)
    }
  }

  return { imported, errors: allErrors }
}
