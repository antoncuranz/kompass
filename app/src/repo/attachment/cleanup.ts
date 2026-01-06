import { SharedTripEntity } from "@/repo/trip/schema"

/**
 * Cleans up attachment references when an entity is deleted.
 * Iterates through all attachments in the trip and removes the entity ID from their references.
 */
export async function cleanupAttachmentReferences(
  stid: string,
  entityId: string,
): Promise<void> {
  const sharedTrip = await SharedTripEntity.load(stid, {
    resolve: {
      trip: { files: { $each: { references: true } } },
    },
  })
  if (!sharedTrip.$isLoaded) {
    throw new Error(
      "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
    )
  }

  const files = sharedTrip.trip.files
  files.forEach(attachment => {
    const index = attachment.references.findIndex(ref => ref === entityId)
    if (index !== -1) {
      attachment.references.$jazz.splice(index, 1)
    }
  })
}
