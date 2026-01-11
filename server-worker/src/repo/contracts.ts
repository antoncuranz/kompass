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
import type { AppConfig } from "../config"

export class AuthRepository extends Context.Tag("AuthRepository")<
  AuthRepository,
  {
    authenticateUser: (
      authHeader: string | undefined,
    ) => Effect.Effect<string, UnauthorizedError, AppConfig>
  }
>() {}

export class TransportationRepository extends Context.Tag(
  "TransportationRepository",
)<
  TransportationRepository,
  {
    fetchLeg: (
      request: FlightLegRequest,
    ) => Effect.Effect<CreateFlightLeg, RepositoryError, AppConfig>
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
    ) => Effect.Effect<
      void,
      RepositoryError | SubscriptionExpiredError,
      AppConfig
    >
  }
>() {}

export class StorageRepository extends Context.Tag("StorageRepository")<
  StorageRepository,
  {
    // Debug
    getDebugInfo: () => Effect.Effect<string, RepositoryError, AppConfig>

    // Transportation list management
    getTransportationListIds: () => Effect.Effect<
      Array<string>,
      RepositoryError,
      AppConfig
    >

    getFlightLegs: (
      listId: string,
    ) => Effect.Effect<
      Array<FlightLeg>,
      RepositoryError | EntityNotFoundError,
      AppConfig
    >

    updateFlightLeg: (
      legId: string,
      data: UpdateFlightLeg,
    ) => Effect.Effect<void, RepositoryError | EntityNotFoundError, AppConfig>

    // Monitor management
    hasMonitor: (
      listId: string,
      userId: string,
    ) => Effect.Effect<boolean, RepositoryError, AppConfig>

    addMonitor: (
      listId: string,
      userId: string,
    ) => Effect.Effect<void, RepositoryError, AppConfig>

    removeMonitor: (
      listId: string,
      userId: string,
    ) => Effect.Effect<void, RepositoryError, AppConfig>

    getSubscribers: (
      listId: string,
    ) => Effect.Effect<
      Array<string>,
      RepositoryError | EntityNotFoundError,
      AppConfig
    >

    // Push subscription management
    getPushSubscriptions: (
      userId: string,
    ) => Effect.Effect<Array<PushSubscription>, RepositoryError, AppConfig>

    addPushSubscription: (
      userId: string,
      subscription: PushSubscription,
    ) => Effect.Effect<void, RepositoryError, AppConfig>

    removePushSubscription: (
      userId: string,
      endpoint: string,
    ) => Effect.Effect<void, RepositoryError, AppConfig>
  }
>() {}
