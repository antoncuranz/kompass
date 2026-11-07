import { beforeEach, expect, it } from "vitest"
import { addTripToCurrentUser } from "./collaboration"
import { useTripRepository } from "@/repo/trip/repository"
import { createTestUser, setupTestEnvironment } from "@/test/setup"

beforeEach(setupTestEnvironment)

it("adds an accessible trip missing from the list and does not duplicate it", async () => {
  const account = await createTestUser("admin", true)
  const repository = useTripRepository()
  const trip = await repository.create({
    name: "Shared trip",
    startDate: "2026-11-07",
    endDate: "2026-11-08",
  })
  await repository.remove(trip.stid)
  const { root } = await account.$jazz.ensureLoaded({
    resolve: { root: { trips: true } },
  })
  expect(root.trips.$jazz.has(trip.stid)).toBe(false)
  expect(await addTripToCurrentUser(trip.stid)).toBe(true)
  expect(root.trips.$jazz.has(trip.stid)).toBe(true)
  expect(await addTripToCurrentUser(trip.stid)).toBe(false)
  expect(Object.keys(root.trips)).toEqual([trip.stid])
})

it("preserves current trips and removes the deprecated map", async () => {
  const account = await createTestUser("admin", true)
  const repository = useTripRepository()
  const current = await repository.create({
    name: "Trip",
    startDate: "2026-11-07",
    endDate: "2026-11-08",
  })
  const { root } = await account.$jazz.ensureLoaded({
    resolve: { root: { trips: true } },
  })
  root.$jazz.set("tripMap", {})
  const listId = root.trips.$jazz.id
  await Promise.resolve(account.migrate())
  const migrated = await account.$jazz.ensureLoaded({
    resolve: { root: { trips: true } },
  })
  expect(migrated.root.trips.$jazz.id).toBe(listId)
  expect(migrated.root.trips.$jazz.has(current.stid)).toBe(true)
  expect(migrated.root.$jazz.has("tripMap")).toBe(false)
  await repository.remove(current.stid)
  await Promise.resolve(account.migrate())
  expect(migrated.root.trips.$jazz.has(current.stid)).toBe(false)
})

it("migrates a legacy account without a trips field and removes the old reference", async () => {
  const account = await createTestUser("admin", true)
  const trip = await useTripRepository().create({
    name: "Legacy trip",
    startDate: "2026-11-07",
    endDate: "2026-11-08",
  })
  const { root } = await account.$jazz.ensureLoaded({
    resolve: { root: { trips: true } },
  })
  const legacyId = root.trips.$jazz.id
  root.$jazz.set("tripMap", root.trips)
  root.$jazz.raw.delete("trips")
  await Promise.resolve(account.migrate())
  const migrated = await account.$jazz.ensureLoaded({
    resolve: { root: { trips: true } },
  })
  expect(migrated.root.trips.$jazz.id).toBe(legacyId)
  expect(migrated.root.trips.$jazz.has(trip.stid)).toBe(true)
  expect(migrated.root.$jazz.has("tripMap")).toBe(false)
  await Promise.resolve(account.migrate())
  expect(migrated.root.trips.$jazz.has(trip.stid)).toBe(true)
})

it("creates new accounts without a deprecated trip map", async () => {
  const account = await createTestUser("admin", true)
  const { root } = await account.$jazz.ensureLoaded({
    resolve: { root: { trips: true } },
  })
  expect(root.$jazz.has("tripMap")).toBe(false)
  expect(Object.keys(root.trips)).toEqual([])
})
