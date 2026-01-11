import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import {
  BadRequest,
  Forbidden,
  InternalServerError,
  NotFound,
  Unauthorized,
} from "@effect/platform/HttpApiError"
import { Schema } from "effect"
import {
  PushSubscriptionEndpoint,
  PushSubscriptionSchema,
} from "./domain/notification"

// Service group - health and internal endpoints
const ServiceGroup = HttpApiGroup.make("Service")
  .add(HttpApiEndpoint.get("health", "/health"))
  .add(
    HttpApiEndpoint.get("get-account", "/internal/get-account")
      .addSuccess(Schema.String)
      .addError(Unauthorized)
      .addError(BadRequest),
  )
  .add(
    HttpApiEndpoint.post("send-notification", "/send-notification")
      .addError(Unauthorized)
      .addError(BadRequest)
      .addError(NotFound),
  )
  .add(HttpApiEndpoint.post("check-flights", "/internal/check-flights"))

// Subscriptions group - push notification subscriptions
const SubscriptionsGroup = HttpApiGroup.make("Subscriptions")
  .add(
    HttpApiEndpoint.get("get-subscriptions", "/web-push/subscriptions")
      .addSuccess(Schema.Array(Schema.String))
      .addError(Unauthorized)
      .addError(BadRequest),
  )
  .add(
    HttpApiEndpoint.post("add-subscription", "/web-push/subscriptions")
      .setPayload(PushSubscriptionSchema)
      .addError(Unauthorized)
      .addError(BadRequest),
  )
  .add(
    HttpApiEndpoint.del("rm-subscription", "/web-push/subscriptions")
      .setPayload(PushSubscriptionEndpoint)
      .addError(Unauthorized)
      .addError(BadRequest)
      .addError(NotFound),
  )

// Monitors group - transportation list monitoring
const MonitorsGroup = HttpApiGroup.make("Monitors")
  .add(
    HttpApiEndpoint.get("get-monitor", "/monitor/:id")
      .setPath(
        Schema.Struct({
          id: Schema.String,
        }),
      )
      .addError(Unauthorized)
      .addError(Forbidden)
      .addError(BadRequest)
      .addError(NotFound),
  )
  .add(
    HttpApiEndpoint.post("add-monitor", "/monitor/:id")
      .setPath(
        Schema.Struct({
          id: Schema.String,
        }),
      )
      .addError(Unauthorized)
      .addError(BadRequest),
  )
  .add(
    HttpApiEndpoint.del("rm-monitor", "/monitor/:id")
      .setPath(
        Schema.Struct({
          id: Schema.String,
        }),
      )
      .addError(Unauthorized)
      .addError(BadRequest),
  )

export const ServerWorkerApi = HttpApi.make("ServerWorkerApi")
  .add(ServiceGroup)
  .add(SubscriptionsGroup)
  .add(MonitorsGroup)
  .addError(InternalServerError)
