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
        HttpApiEndpoint.get("gen-vapid", "/gen-vapid").addSuccess(
          Schema.String,
        ),
      )
      .add(
        HttpApiEndpoint.get("get-token", "/get-token").addSuccess(
          Schema.String,
        ),
      )
      .add(
        HttpApiEndpoint.get("get-account", "/get-account")
          .addSuccess(Schema.String)
          .addError(Unauthorized)
          .addError(BadRequest),
      )
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
        HttpApiEndpoint.get("send-notification", "/send-notification")
          .addError(Unauthorized)
          .addError(BadRequest)
          .addError(NotFound),
      ),
  )
  .addError(InternalServerError)
