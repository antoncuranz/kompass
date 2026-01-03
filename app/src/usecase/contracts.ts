import type {
  Accommodation,
  Activity,
  CreateAccommodation,
  CreateActivity,
  CreateFileAttachment,
  CreateFlight,
  CreateGenericTransportation,
  CreateTrain,
  CreateTrip,
  FileAttachment,
  Flight,
  GenericTransportation,
  Train,
  Transportation,
  Trip,
  UpdateAccommodation,
  UpdateActivity,
  UpdateFileAttachment,
  UpdateFlight,
  UpdateGenericTransportation,
  UpdateTrain,
  UpdateTrip,
} from "@/domain"

// TODOs:
// - either add stid to getter or remove it everywhere
// - rename actions to just create/update/delete
// - create wrapping hook that retrieve stid from context (don't specify interface)
// - we need a getter for a single item by id. Might be useful to return loadingState as well.

export interface TripStorage {
  trips: Array<Trip>
  // findById: (stid: string) => Promise<Trip>
  // getMetadata?

  create: (values: CreateTrip) => Promise<Trip>
  update: (stid: string, values: UpdateTrip) => Promise<Trip>
  delete: (stid: string) => Promise<void>
}

export interface ActivityStorage {
  activities: Array<Activity>
  create: (stid: string, values: CreateActivity) => Promise<Activity>
  update: (id: string, values: UpdateActivity) => Promise<Activity>
  delete: (stid: string, id: string) => Promise<void>
}

export interface AccommodationStorage {
  accommodation: Array<Accommodation>
  create: (stid: string, values: CreateAccommodation) => Promise<Accommodation>
  update: (id: string, values: UpdateAccommodation) => Promise<Accommodation>
  delete: (stid: string, id: string) => Promise<void>
}

export interface TransportationStorage {
  transportation: Array<Transportation>
  createFlight: (stid: string, values: CreateFlight) => Promise<Flight>
  updateFlight: (id: string, values: UpdateFlight) => Promise<Flight>
  createTrain: (stid: string, values: CreateTrain) => Promise<Train>
  updateTrain: (id: string, values: UpdateTrain) => Promise<Train>
  createGeneric: (
    stid: string,
    values: CreateGenericTransportation,
  ) => Promise<GenericTransportation>
  updateGeneric: (
    id: string,
    values: UpdateGenericTransportation,
  ) => Promise<GenericTransportation>
  delete: (stid: string, id: string) => Promise<void>
}

export interface AttachmentStorage {
  attachments: Array<FileAttachment>
  create: (
    stid: string,
    values: CreateFileAttachment,
  ) => Promise<FileAttachment>
  update: (id: string, values: UpdateFileAttachment) => Promise<FileAttachment>
  delete: (stid: string, id: string) => Promise<void>
  loadAsBlob: (id: string) => Promise<Blob | undefined>
}
