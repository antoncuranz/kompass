import { Group } from "jazz-tools"
import { mapFlight, mapGenericTransportation, mapTrain } from "./mappers"
import {
  FlightEntity,
  GenericTransportationEntity,
  TrainEntity,
} from "./schema"
import type { TransportationMutations } from "@/repo/contracts"
import { SharedTripEntity } from "@/repo/trip/schema"

export function useTransportationMutations(
  stid: string,
): TransportationMutations {
  return {
    createFlight: async values => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { members: true, trip: { transportation: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const transportation = sharedTrip.trip.transportation

      const group = Group.create()
      group.addMember(transportation.$jazz.owner)

      const { pnrs, ...rest } = values
      const entity = FlightEntity.create(
        {
          type: "flight",
          ...rest,
          pnrs: pnrs,
        },
        group,
      )
      entity.pnrs.$jazz.owner.addMember(sharedTrip.members) // required because the PNR list has onInlineCreate: "newGroup"

      transportation.$jazz.push(entity)
      return mapFlight(entity)
    },

    updateFlight: async (flightId, values) => {
      const entity = await FlightEntity.load(flightId)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load FlightEntity: " + entity.$jazz.loadingState,
        )
      }

      const { pnrs, ...rest } = values
      entity.$jazz.applyDiff(rest)
      if (entity.pnrs.$isLoaded) {
        entity.pnrs.$jazz.applyDiff(pnrs ?? [])
      }

      return mapFlight(entity)
    },

    createTrain: async values => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { transportation: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const transportation = sharedTrip.trip.transportation

      const group = Group.create()
      group.addMember(transportation.$jazz.owner)

      const entity = TrainEntity.create(
        {
          type: "train",
          ...values,
        },
        group,
      )

      transportation.$jazz.push(entity)
      return mapTrain(entity)
    },

    updateTrain: async (trainId, values) => {
      const entity = await TrainEntity.load(trainId)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load TrainEntity: " + entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      return mapTrain(entity)
    },

    createGeneric: async values => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { transportation: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const transportation = sharedTrip.trip.transportation

      const group = Group.create()
      group.addMember(transportation.$jazz.owner)

      const entity = GenericTransportationEntity.create(
        {
          type: "generic",
          ...values,
          geoJson: values.geoJson,
        },
        group,
      )

      transportation.$jazz.push(entity)
      return mapGenericTransportation(entity)
    },

    updateGeneric: async (transportationId, values) => {
      const entity = await GenericTransportationEntity.load(transportationId)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load GenericTransportationEntity: " +
            entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      return mapGenericTransportation(entity)
    },

    remove: async id => {
      const sharedTrip = await SharedTripEntity.load(stid, {
        resolve: { trip: { transportation: true } },
      })
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      sharedTrip.trip.transportation.$jazz.remove(t => t.$jazz.id === id)
    },
  }
}
