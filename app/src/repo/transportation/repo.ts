import { useCoState } from "jazz-tools/react-core"
import { useEffect, useState } from "react"
import { Group } from "jazz-tools"
import { mapFlight, mapGenericTransportation, mapTrain } from "./mappers"
import type { TransportationRepo } from "@/usecase/contracts"
import type { TransportationEntity } from "@/repo/jazzSchema"
import type {
  CreateFlight,
  CreateGenericTransportation,
  CreateTrain,
  Transportation,
  UpdateFlight,
  UpdateGenericTransportation,
  UpdateTrain,
} from "@/domain"
import type { co } from "jazz-tools"
import {
  FlightEntity,
  GenericTransportationEntity,
  SharedTripEntity,
  TrainEntity,
} from "@/repo/jazzSchema"

export function useTransportation(stid: string): TransportationRepo {
  const entities = useCoState(SharedTripEntity, stid, {
    select: st => (st.$isLoaded ? st.trip.transportation : []),
  })
  const [transportation, setTransportation] = useState<Array<Transportation>>(
    [],
  )

  async function loadAndMapTransportation(
    transportation: co.loaded<typeof TransportationEntity>,
  ): Promise<Transportation> {
    switch (transportation.type) {
      case "flight":
        return mapFlight(
          await transportation.$jazz.ensureLoaded({
            resolve: FlightEntity.resolveQuery,
          }),
        )

      case "train":
        return mapTrain(
          await transportation.$jazz.ensureLoaded({
            resolve: TrainEntity.resolveQuery,
          }),
        )

      case "generic":
        return mapGenericTransportation(
          await transportation.$jazz.ensureLoaded({
            resolve: GenericTransportationEntity.resolveQuery,
          }),
        )
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      const result = await Promise.all(entities.map(loadAndMapTransportation))
      if (!cancelled) {
        setTransportation(result)
      }
    }

    void loadAll()

    return () => {
      cancelled = true
    }
  }, [entities])

  return {
    transportation: transportation,

    createFlight: async (values: CreateFlight) => {
      const sharedTrip = await SharedTripEntity.load(stid)
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      const transportation = sharedTrip.trip.transportation

      const group = Group.create()
      group.addMember(transportation.$jazz.owner)

      const entity = FlightEntity.create(
        {
          type: "flight",
          ...values,
        },
        group,
      )
      entity.pnrs.$jazz.owner.addMember(sharedTrip.members) // required because the PNR list has onInlineCreate: "newGroup"

      transportation.$jazz.push(entity)
      return mapFlight(entity)
    },

    updateFlight: async (flightId: string, values: UpdateFlight) => {
      const entity = await FlightEntity.load(flightId)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load FlightEntity: " + entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      return mapFlight(entity)
    },

    createTrain: async (values: CreateTrain) => {
      const sharedTrip = await SharedTripEntity.load(stid)
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

    updateTrain: async (trainId: string, values: UpdateTrain) => {
      const entity = await TrainEntity.load(trainId)
      if (!entity.$isLoaded) {
        throw new Error(
          "Unable to load TrainEntity: " + entity.$jazz.loadingState,
        )
      }

      entity.$jazz.applyDiff(values)
      return mapTrain(entity)
    },

    createGeneric: async (values: CreateGenericTransportation) => {
      const sharedTrip = await SharedTripEntity.load(stid)
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
        },
        group,
      )

      transportation.$jazz.push(entity)
      return mapGenericTransportation(entity)
    },

    updateGeneric: async (
      transportationId: string,
      values: UpdateGenericTransportation,
    ) => {
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

    delete: async (id: string) => {
      const sharedTrip = await SharedTripEntity.load(stid)
      if (!sharedTrip.$isLoaded) {
        throw new Error(
          "Unable to load SharedTripEntity: " + sharedTrip.$jazz.loadingState,
        )
      }

      sharedTrip.trip.transportation.$jazz.remove(t => t.$jazz.id === id)
    },
  }
}
