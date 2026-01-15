import * as z from "zod"

export type UnavailableReason = "loading" | "unavailable" | "unauthorized"
export type NotLoaded = {
  $loadingState: UnavailableReason
  $isLoaded: false
}
export type Loaded<T> = T & {
  $loadingState: "loaded"
  $isLoaded: true
}
export type Maybe<T> = Loaded<T> | NotLoaded

export const Maybe = {
  of<T>(value: T): Loaded<T> {
    return Object.assign(value as object, {
      $loadingState: "loaded" as const,
      $isLoaded: true as const,
    }) as Loaded<T>
  },
  notLoaded(reason: UnavailableReason): NotLoaded {
    return { $loadingState: reason, $isLoaded: false }
  },
  loading(): NotLoaded {
    return { $loadingState: "loading", $isLoaded: false }
  },
  unavailable(): NotLoaded {
    return { $loadingState: "unavailable", $isLoaded: false }
  },
  unauthorized(): NotLoaded {
    return { $loadingState: "unauthorized", $isLoaded: false }
  },
}

export const Pricing = z.object({
  amountPaid: z.number().optional(),
  amountRemaining: z.number().optional(),
  dueCurrency: z.string().optional(),
  dueDate: z.iso.date().optional(),
})
export type Pricing = z.infer<typeof Pricing>

export const CreatePricing = Pricing
export type CreatePricing = z.infer<typeof CreatePricing>

export function getPricingTotal(p?: Pricing): number | undefined {
  if (!p) return undefined
  if (p.dueCurrency) return undefined
  const paid = p.amountPaid ?? 0
  const remaining = p.amountRemaining ?? 0
  return paid + remaining || undefined
}

export function isOverdue(p?: Pricing): boolean {
  if (!p?.dueDate || !p.amountRemaining) return false
  return new Date(p.dueDate) < new Date() && p.amountRemaining > 0
}
