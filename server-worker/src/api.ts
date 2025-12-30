import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import {
  BadRequest,
  InternalServerError,
  NotFound,
  Unauthorized,
} from "@effect/platform/HttpApiError"
import { Schema } from "effect"
import { PushSubscription } from "./schema"

export const ServerWorkerApi = HttpApi.make("ServerWorkerApi")
  .add(
    HttpApiGroup.make("Main")
      .add(HttpApiEndpoint.get("health", "/health"))
      .add(
        HttpApiEndpoint.post("subscribe", "/subscribe")
          .setPayload(PushSubscription)
          .addError(Unauthorized)
          .addError(BadRequest),
      )
      .add(
        HttpApiEndpoint.post("unsubscribe", "/unsubscribe")
          .addError(Unauthorized)
          .addError(BadRequest),
      )
      .add(
        HttpApiEndpoint.post("send-notification", "/send-notification")
          .addError(Unauthorized)
          .addError(BadRequest)
          .addError(NotFound),
      )
      .add(
        HttpApiEndpoint.get("get-account", "/internal/get-account")
          .addSuccess(Schema.String)
          .addError(Unauthorized)
          .addError(BadRequest),
      ),
  )
  .addError(InternalServerError)
