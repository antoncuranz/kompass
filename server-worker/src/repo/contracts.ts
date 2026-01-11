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
import type { UnauthorizedError } from "../domain/auth"

export class AuthRepository extends Context.Tag("AuthRepository")<
  AuthRepository,
  {
    authenticateUser: (
      authHeader: string | undefined,
    ) => Effect.Effect<string, UnauthorizedError>
  }
>() {}

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
    // Debug
    getDebugInfo: () => Effect.Effect<string, RepositoryError>

    // Transportation list management
    getTransportationListIds: () => Effect.Effect<
      Array<string>,
      RepositoryError
    >

    getFlightLegs: (
      listId: string,
    ) => Effect.Effect<Array<FlightLeg>, RepositoryError | EntityNotFoundError>

    updateFlightLeg: (
      legId: string,
      data: UpdateFlightLeg,
    ) => Effect.Effect<void, RepositoryError | EntityNotFoundError>

    // Monitor management
    hasMonitor: (
      listId: string,
      userId: string,
    ) => Effect.Effect<boolean, RepositoryError>

    addMonitor: (
      listId: string,
      userId: string,
    ) => Effect.Effect<void, RepositoryError>

    removeMonitor: (
      listId: string,
      userId: string,
    ) => Effect.Effect<void, RepositoryError>

    getSubscribers: (
      listId: string,
    ) => Effect.Effect<Array<string>, RepositoryError | EntityNotFoundError>

    // Push subscription management
    getSubscriptionEndpoints: (
      userId: string,
    ) => Effect.Effect<Array<string>, RepositoryError>

    getPushSubscriptions: (
      userId: string,
    ) => Effect.Effect<Array<PushSubscription>, RepositoryError>

    addPushSubscription: (
      userId: string,
      subscription: PushSubscription,
    ) => Effect.Effect<void, RepositoryError>

    removePushSubscription: (
      userId: string,
      endpoint: string,
    ) => Effect.Effect<void, RepositoryError>
  }
>() {}
