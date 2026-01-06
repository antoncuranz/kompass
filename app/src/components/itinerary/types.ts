import type { Accommodation, Activity, Transportation } from "@/domain"

export type DayRenderData = {
  day: string
  transportation: Array<Transportation>
  activities: Array<Activity>
  accommodation: Accommodation | undefined
}
