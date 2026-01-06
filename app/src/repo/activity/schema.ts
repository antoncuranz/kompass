import { co, z } from "jazz-tools"
import { LocationEntity } from "@/repo/common/schema"

export const ActivityEntity = co
  .map({
    name: z.string(),
    description: z.string().optional(),
    date: z.iso.date(),
    time: z.iso.time().optional(),
    price: z.number().optional(),
    address: z.string().optional(),
    location: LocationEntity.optional(),
  })
  .resolved({ location: LocationEntity.resolveQuery })
