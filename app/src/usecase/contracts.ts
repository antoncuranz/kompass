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
  Maybe,
  Train,
  Transportation,
  Trip,
  TripMeta,
  UpdateAccommodation,
  UpdateActivity,
  UpdateFileAttachment,
  UpdateFlight,
  UpdateGenericTransportation,
  UpdateTrain,
  UpdateTrip,
  UpdateUser,
  User,
} from "@/domain"

export interface SingleUserRepo {
  user: Maybe<User>
  update: (values: UpdateUser) => Promise<void>
}

export interface TripRepo {
  trips: Array<Trip>
  // findById: (stid: string) => Promise<Trip>
  // getMetadata?

  create: (values: CreateTrip) => Promise<Trip>
  update: (stid: string, values: UpdateTrip) => Promise<Trip>
  remove: (stid: string) => Promise<void>
}

export interface SingleTripRepo {
  trip: Maybe<Trip>
  meta: Maybe<TripMeta>
}

export interface ActivityRepo {
  activities: Array<Activity>
  create: (values: CreateActivity) => Promise<Activity>
  update: (id: string, values: UpdateActivity) => Promise<Activity>
  remove: (id: string) => Promise<void>
}

export interface AccommodationRepo {
  accommodation: Array<Accommodation>
  create: (values: CreateAccommodation) => Promise<Accommodation>
  update: (id: string, values: UpdateAccommodation) => Promise<Accommodation>
  remove: (id: string) => Promise<void>
}

export interface TransportationRepo {
  transportation: Array<Transportation>
  createFlight: (values: CreateFlight) => Promise<Flight>
  updateFlight: (id: string, values: UpdateFlight) => Promise<Flight>
  createTrain: (values: CreateTrain) => Promise<Train>
  updateTrain: (id: string, values: UpdateTrain) => Promise<Train>
  createGeneric: (
    values: CreateGenericTransportation,
  ) => Promise<GenericTransportation>
  updateGeneric: (
    id: string,
    values: UpdateGenericTransportation,
  ) => Promise<GenericTransportation>
  remove: (id: string) => Promise<void>
}

export interface AttachmentRepo {
  attachments: Array<FileAttachment>
  create: (values: CreateFileAttachment) => Promise<FileAttachment>
  update: (id: string, values: UpdateFileAttachment) => Promise<FileAttachment>
  remove: (id: string) => Promise<void>
}

export interface SingleAttachmentRepo {
  attachment: Maybe<FileAttachment>
  loadAsBlob: () => Promise<Blob | undefined>
}
