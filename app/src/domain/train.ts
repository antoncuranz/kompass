import * as z from "zod"
import { CreateLocation, Location } from "./"

const TrainStation = z.object({
  id: z.string(),
  name: z.string(),
  location: Location,
})
export type TrainStation = z.infer<typeof TrainStation>
const CreateTrainStation = z.object({
  ...TrainStation.shape,
  location: CreateLocation,
})

const TrainLeg = z.object({
  id: z.string(),
  origin: TrainStation,
  destination: TrainStation,
  departureDateTime: z.iso.datetime(),
  arrivalDateTime: z.iso.datetime(),
  durationInMinutes: z.number(),
  lineName: z.string(),
  operatorName: z.string(),
})
export type TrainLeg = z.infer<typeof TrainLeg>
export const CreateTrainLeg = z
  .object({
    ...TrainLeg.shape,
    origin: CreateTrainStation,
    destination: CreateTrainStation,
  })
  .omit({ id: true })

export const Train = z.object({
  id: z.string(),
  type: z.literal("train"),
  legs: z.array(TrainLeg),
  refreshToken: z.string().optional(),
  price: z.number().optional(),
  geoJson: z.object().optional(),
})
export type Train = z.infer<typeof Train>

export const CreateTrain = z
  .object({
    ...Train.shape,
    legs: z.array(CreateTrainLeg),
  })
  .omit({ id: true, type: true })
export type CreateTrain = z.infer<typeof CreateTrain>

export const UpdateTrain = CreateTrain.partial()
export type UpdateTrain = z.infer<typeof UpdateTrain>
