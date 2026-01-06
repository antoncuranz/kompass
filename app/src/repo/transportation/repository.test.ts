import { beforeEach, describe, expect, it } from "vitest"
import { useTripRepository } from "../trip/repository"
import { useAttachmentRepository } from "../attachment/repository"
import { createTestUser, setupTestEnvironment } from "../../test/setup"
import { assertTripPermissions } from "../../test/permissions"
import { FileAttachmentEntity } from "../attachment/schema"
import { useTransportationRepository } from "./repository"
import type { GeoJSONFeatureCollection } from "zod-geojson"

describe("TransportationRepository", () => {
  let tripStid: string
  let admin: any

  beforeEach(async () => {
    await setupTestEnvironment()
    const tripMutations = useTripRepository()
    admin = await createTestUser("admin", true)
    const trip = await tripMutations.create({
      name: "Test Trip",
      startDate: "2024-01-01",
      endDate: "2024-01-07",
    })
    tripStid = trip.stid
  })

  const airport = {
    iata: "TXL",
    name: "Tegel",
    municipality: "Berlin",
    location: { latitude: 52.55, longitude: 13.28 },
  }

  const station = {
    id: "1",
    name: "Berlin Hbf",
    location: { latitude: 52.52, longitude: 13.36 },
  }

  const location = { latitude: 52.52, longitude: 13.4 }

  describe("Flight", () => {
    it("should create a flight and verify permissions", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const flightData = {
        legs: [
          {
            origin: airport,
            destination: airport,
            airline: "LH",
            flightNumber: "123",
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
          },
        ],
        pnrs: [],
      }

      // when
      const flight = await mutations.createFlight(flightData)

      // then
      expect(flight.legs).toHaveLength(1)
      expect(flight.legs[0].airline).toBe("LH")
      expect(flight.pnrs).toHaveLength(0)
      await assertTripPermissions(tripStid, admin)
    })

    it("should update a flight with PNRS and verify permissions (Testcase 1)", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const flight = await mutations.createFlight({
        legs: [
          {
            origin: airport,
            destination: airport,
            airline: "LH",
            flightNumber: "123",
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
          },
        ],
        pnrs: [],
      })
      const pnrs = [{ airline: "LH", pnr: "ABCDEF" }]

      // when
      const updated = await mutations.updateFlight(flight.id, {
        pnrs,
      })

      // then
      expect(updated.pnrs).toHaveLength(1)
      expect(updated.pnrs[0].pnr).toBe("ABCDEF")
      await assertTripPermissions(tripStid, admin)
    })

    it("should update a flight to empty PNRS and verify permissions (Testcase 2)", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const flight = await mutations.createFlight({
        legs: [
          {
            origin: airport,
            destination: airport,
            airline: "LH",
            flightNumber: "123",
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
          },
        ],
        pnrs: [{ airline: "LH", pnr: "ABCDEF" }],
      })

      // when
      const updated = await mutations.updateFlight(flight.id, {
        pnrs: [],
      })

      // then
      expect(updated.pnrs).toHaveLength(0)
      await assertTripPermissions(tripStid, admin)
    })

    it("should remove a flight and verify permissions", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const flight = await mutations.createFlight({
        legs: [
          {
            origin: airport,
            destination: airport,
            airline: "LH",
            flightNumber: "123",
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
          },
        ],
        pnrs: [],
      })

      // when
      await mutations.remove(flight.id)

      // then
      await assertTripPermissions(tripStid, admin)
    })

    it("should remove flight reference from attachments when flight is removed", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const attachmentMutations = useAttachmentRepository(tripStid)
      const flight = await mutations.createFlight({
        legs: [
          {
            origin: airport,
            destination: airport,
            airline: "LH",
            flightNumber: "123",
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
          },
        ],
        pnrs: [],
      })
      const attachment = await attachmentMutations.create({
        name: "Flight Attachment",
        file: new File(
          [new Blob(["test"], { type: "text/plain" })],
          "test.txt",
        ),
        references: [flight.id],
      })

      // when
      await mutations.remove(flight.id)

      // then
      const updatedAttachment = await FileAttachmentEntity.load(attachment.id)
      if (!updatedAttachment.$isLoaded) {
        throw new Error("Unable to load updated attachment")
      }
      expect(updatedAttachment.references).not.toContain(flight.id)
    })
  })

  describe("Train", () => {
    it("should create a train and verify permissions", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const trainData = {
        legs: [
          {
            origin: station,
            destination: station,
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
            lineName: "ICE 1",
            operatorName: "DB",
          },
        ],
      }

      // when
      const train = await mutations.createTrain(trainData)

      // then
      expect(train.legs).toHaveLength(1)
      expect(train.legs[0].lineName).toBe("ICE 1")
      await assertTripPermissions(tripStid, admin)
    })

    it("should update a train with refreshToken and verify permissions (Testcase 1)", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const train = await mutations.createTrain({
        legs: [
          {
            origin: station,
            destination: station,
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
            lineName: "ICE 1",
            operatorName: "DB",
          },
        ],
      })

      // when
      const updated = await mutations.updateTrain(train.id, {
        refreshToken: "token123",
      })

      // then
      expect(updated.refreshToken).toBe("token123")
      await assertTripPermissions(tripStid, admin)
    })

    it("should update a train to undefined refreshToken and verify permissions (Testcase 2)", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const train = await mutations.createTrain({
        legs: [
          {
            origin: station,
            destination: station,
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
            lineName: "ICE 1",
            operatorName: "DB",
          },
        ],
        refreshToken: "token123",
      })

      // when
      const updated = await mutations.updateTrain(train.id, {
        refreshToken: undefined,
      })

      // then
      expect(updated.refreshToken).toBeUndefined()
      await assertTripPermissions(tripStid, admin)
    })

    it("should remove a train and verify permissions", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const train = await mutations.createTrain({
        legs: [
          {
            origin: station,
            destination: station,
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
            lineName: " ICE 1",
            operatorName: "DB",
          },
        ],
      })

      // when
      await mutations.remove(train.id)

      // then
      await assertTripPermissions(tripStid, admin)
    })

    it("should remove train reference from attachments when train is removed", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const attachmentMutations = useAttachmentRepository(tripStid)
      const train = await mutations.createTrain({
        legs: [
          {
            origin: station,
            destination: station,
            departureDateTime: "2024-01-01T10:00:00Z",
            arrivalDateTime: "2024-01-01T12:00:00Z",
            durationInMinutes: 120,
            lineName: "ICE 1",
            operatorName: "DB",
          },
        ],
      })
      const attachment = await attachmentMutations.create({
        name: "Train Attachment",
        file: new File(
          [new Blob(["test"], { type: "text/plain" })],
          "test.txt",
        ),
        references: [train.id],
      })

      // when
      await mutations.remove(train.id)

      // then
      const updatedAttachment = await FileAttachmentEntity.load(attachment.id)
      if (!updatedAttachment.$isLoaded) {
        throw new Error("Unable to load updated attachment")
      }
      expect(updatedAttachment.references).not.toContain(train.id)
    })
  })

  describe("Generic", () => {
    it("should create generic transportation and verify permissions", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const genericData = {
        name: "Test Ride",
        genericType: "car" as const,
        departureDateTime: "2024-01-01T10:00:00Z",
        arrivalDateTime: "2024-01-01T12:00:00Z",
        origin: location,
        destination: location,
      }

      // when
      const generic = await mutations.createGeneric(genericData)

      // then
      expect(generic.name).toBe(genericData.name)
      expect(generic.genericType).toBe(genericData.genericType)
      await assertTripPermissions(tripStid, admin)
    })

    it("should update generic transportation with geoJson and verify permissions (Testcase 1)", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const generic = await mutations.createGeneric({
        name: "Test Ride",
        genericType: "car",
        departureDateTime: "2024-01-01T10:00:00Z",
        arrivalDateTime: "2024-01-01T12:00:00Z",
        origin: location,
        destination: location,
      })
      const geoJson: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      }

      // when
      const updated = await mutations.updateGeneric(generic.id, {
        geoJson,
      })

      // then
      expect(updated.geoJson).toEqual(geoJson)
      await assertTripPermissions(tripStid, admin)
    })

    it("should update generic transportation to undefined geoJson and verify permissions (Testcase 2)", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const geoJson: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      }
      const generic = await mutations.createGeneric({
        name: "Test Ride",
        genericType: "car",
        departureDateTime: "2024-01-01T10:00:00Z",
        arrivalDateTime: "2024-01-01T12:00:00Z",
        origin: location,
        destination: location,
        geoJson,
      })

      // when
      const updated = await mutations.updateGeneric(generic.id, {
        geoJson: undefined,
      })

      // then
      expect(updated.geoJson).toBeUndefined()
      await assertTripPermissions(tripStid, admin)
    })

    it("should remove generic transportation and verify permissions", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const generic = await mutations.createGeneric({
        name: "Test Ride",
        genericType: "car",
        departureDateTime: "2024-01-01T10:00:00Z",
        arrivalDateTime: "2024-01-01T12:00:00Z",
        origin: location,
        destination: location,
      })

      // when
      await mutations.remove(generic.id)

      // then
      await assertTripPermissions(tripStid, admin)
    })

    it("should remove generic reference from attachments when generic is removed", async () => {
      // given
      const mutations = useTransportationRepository(tripStid)
      const attachmentMutations = useAttachmentRepository(tripStid)
      const generic = await mutations.createGeneric({
        name: "Test Ride",
        genericType: "car",
        departureDateTime: "2024-01-01T10:00:00Z",
        arrivalDateTime: "2024-01-01T12:00:00Z",
        origin: location,
        destination: location,
      })
      const attachment = await attachmentMutations.create({
        name: "Generic Attachment",
        file: new File(
          [new Blob(["test"], { type: "text/plain" })],
          "test.txt",
        ),
        references: [generic.id],
      })

      // when
      await mutations.remove(generic.id)

      // then
      const updatedAttachment = await FileAttachmentEntity.load(attachment.id)
      if (!updatedAttachment.$isLoaded) {
        throw new Error("Unable to load updated attachment")
      }
      expect(updatedAttachment.references).not.toContain(generic.id)
    })
  })
})
