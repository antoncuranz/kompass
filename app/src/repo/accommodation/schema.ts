import { co, z } from "jazz-tools"
import { LocationEntity, PricingEntity } from "@/repo/common/schema"

export const AccommodationEntity = co
  .map({
    name: z.string(),
    description: z.string().optional(),
    arrivalDate: z.iso.date(),
    departureDate: z.iso.date(),
    pricing: PricingEntity.optional(),
    address: z.string().optional(),
    location: LocationEntity.optional(),
  })
  .resolved({
    location: LocationEntity.resolveQuery,
    pricing: PricingEntity.resolveQuery,
  })
