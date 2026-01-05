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

// ============================================================================
// Query interfaces (single-item readers)
// ============================================================================

export interface UserQuery {
  user: Maybe<User>
  update: (values: UpdateUser) => Promise<void>
}

export interface TripQuery {
  trip: Maybe<Trip>
  meta: Maybe<TripMeta>
}

export interface AttachmentQuery {
  attachment: Maybe<FileAttachment>
  loadAsBlob: () => Promise<Blob | undefined>
}

// ============================================================================
// Subscription interfaces (reactive read-only data)
// ============================================================================

export interface TripSubscription {
  trips: Array<Trip>
}

export interface ActivitySubscription {
  activities: Array<Activity>
}

export interface AccommodationSubscription {
  accommodation: Array<Accommodation>
}

export interface TransportationSubscription {
  transportation: Array<Transportation>
}

export interface AttachmentSubscription {
  attachments: Array<FileAttachment>
}

// ============================================================================
// Mutation interfaces (CRUD operations)
// ============================================================================

export interface TripMutations {
  create: (values: CreateTrip) => Promise<Trip>
  update: (stid: string, values: UpdateTrip) => Promise<Trip>
  remove: (stid: string) => Promise<void>
}

export interface ActivityMutations {
  create: (values: CreateActivity) => Promise<Activity>
  update: (id: string, values: UpdateActivity) => Promise<Activity>
  remove: (id: string) => Promise<void>
}

export interface AccommodationMutations {
  create: (values: CreateAccommodation) => Promise<Accommodation>
  update: (id: string, values: UpdateAccommodation) => Promise<Accommodation>
  remove: (id: string) => Promise<void>
}

export interface TransportationMutations {
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

export interface AttachmentMutations {
  create: (values: CreateFileAttachment) => Promise<FileAttachment>
  update: (id: string, values: UpdateFileAttachment) => Promise<FileAttachment>
  remove: (id: string) => Promise<void>
}
