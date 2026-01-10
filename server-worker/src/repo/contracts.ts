import { Context } from "effect"
import type { Effect } from "effect"
import type {
  CreateFlightLeg,
  FlightLeg,
  FlightLegRequest,
  UpdateFlightLeg,
} from "../domain/transportation"
import type { PushNotification, PushSubscription } from "../domain/notification"
import type {
  EntityNotFoundError,
  RepositoryError,
  SubscriptionExpiredError,
} from "../domain/errors"

export class TransportationRepository extends Context.Tag(
  "TransportationRepository",
)<
  TransportationRepository,
  {
    fetchLeg: (
      request: FlightLegRequest,
    ) => Effect.Effect<CreateFlightLeg, RepositoryError>
  }
>() {}

export class NotificationRepository extends Context.Tag(
  "NotificationRepository",
)<
  NotificationRepository,
  {
    send: (
      subscription: PushSubscription,
      notification: PushNotification,
    ) => Effect.Effect<void, RepositoryError | SubscriptionExpiredError>
  }
>() {}

export class StorageRepository extends Context.Tag("StorageRepository")<
  StorageRepository,
  {
    // We might want to fetch a whole list, but for the checker we iterate lists.
    // We need to fetch all Transportation Lists (ServerWorkerAccount root).
    getTransportationListIds: () => Effect.Effect<
      Array<string>,
      RepositoryError
    >

    // Get all flights in a transportation list
    getFlightLegs: (
      listId: string,
    ) => Effect.Effect<Array<FlightLeg>, RepositoryError | EntityNotFoundError>

    getSubscribers: (
      listId: string,
    ) => Effect.Effect<Array<string>, RepositoryError | EntityNotFoundError>

    getPushSubscriptions: (
      userId: string,
    ) => Effect.Effect<Array<PushSubscription>, RepositoryError>

    removePushSubscription: (
      userId: string,
      endpoint: string,
    ) => Effect.Effect<void, RepositoryError>

    updateFlightLeg: (
      legId: string,
      data: UpdateFlightLeg,
    ) => Effect.Effect<void, RepositoryError | EntityNotFoundError>
  }
>() {}
