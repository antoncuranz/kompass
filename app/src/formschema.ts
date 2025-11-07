import { dateTimeToString, dateToString } from "@/components/util.ts"
import { z } from "jazz-tools"
import * as core from "zod/v4/core"

export function optionalString(params?: string | core.$ZodStringParams) {
  return z
    .string(params)
    .trim()
    .transform(x => x || undefined)
    .optional()
}

export function isoDate(params?: string | core.$ZodDateParams) {
  return z.date(params).transform(dateToString)
}

export function dateRange(params?: string | core.$ZodObjectParams) {
  return z.object(
    {
      from: isoDate("Required"),
      to: isoDate("Required"),
    },
    params,
  )
}

export function isoDateTime(params?: string | core.$ZodDateParams) {
  return z.date(params).transform(dateTimeToString)
}

export function optionalNumberString(params?: string | core.$ZodStringParams) {
  return z.string(params).transform(x => (x ? Number(x) : undefined))
}

export function location(params?: string | core.$ZodObjectParams) {
  return z.object(
    {
      latitude: z.number(),
      longitude: z.number(),
    },
    params,
  )
}

export function optionalLocation(params?: string | core.$ZodObjectParams) {
  return z
    .object(
      {
        latitude: z.number(),
        longitude: z.number(),
      },
      params,
    )
    .transform(x => (x.latitude && x.longitude ? x : undefined))
    .optional()
}

export function trainStation(params?: string | core.$ZodObjectParams) {
  return z
    .object(
      {
        id: z.string().nonempty(),
        name: z.string().nonempty(),
      },
      params,
    )
    .transform(station => station.id)
}
