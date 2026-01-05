import { expect } from "vitest"
import { createTestUser } from "./setup"
import { flightResolveQuery, loadSharedTrip } from "./trip-loader"
import type { Account, CoValue, Group, co } from "jazz-tools"
import type { SharedTripEntity } from "@/repo/trip/schema"
import type { LoadedSharedTrip } from "./trip-loader"
import {
  GenericTransportationEntity,
  TrainEntity,
} from "@/repo/transportation/schema"

// Permission abbreviations: rw = read+write, r = read-only, w = write-only, - = none
type Access = "rw" | "r" | "w" | "-"

interface AccessCheck {
  admin: Access
  member: Access
  guest: Access
  worker: Access
  public: Access
}

interface TestUsers {
  admin: Account
  member: Account
  guest: Account
  worker: Account
  public: Account
}

export function assertRoleInGroup(
  group: Group,
  account: Account,
  expectedRole: "admin" | "writer" | "reader" | undefined,
) {
  const role = group.getRoleOf(account.$jazz.id)
  if (role !== expectedRole) {
    throw new Error(
      `Expected role ${expectedRole} but got ${role} for account ${account.$jazz.id} in group ${group.$jazz.id}`,
    )
  }
}

function checkAccess(account: Account, entity: CoValue, expected: Access) {
  const entityId = entity.$jazz.id
  const canRead = account.canRead(entity)
  const canWrite = account.canWrite(entity)

  switch (expected) {
    case "rw":
      expect(canRead, `Expected read for ${entityId}`).toBe(true)
      expect(canWrite, `Expected write for ${entityId}`).toBe(true)
      break
    case "r":
      expect(canRead, `Expected read for ${entityId}`).toBe(true)
      expect(canWrite, `Expected no write for ${entityId}`).toBe(false)
      break
    case "w":
      // expect(canRead, `Expected no read for ${entityId}`).toBe(false) // users can read their own submissions
      expect(canWrite, `Expected write for ${entityId}`).toBe(true)
      break
    case "-":
      expect(canRead, `Expected no read for ${entityId}`).toBe(false)
      expect(canWrite, `Expected no write for ${entityId}`).toBe(false)
      break
  }
}

function assertAccessMatrix(
  users: TestUsers,
  checks: Map<CoValue, AccessCheck>,
) {
  for (const [entity, accessCheck] of checks) {
    checkAccess(users.admin, entity, accessCheck.admin)
    checkAccess(users.member, entity, accessCheck.member)
    checkAccess(users.guest, entity, accessCheck.guest)
    checkAccess(users.worker, entity, accessCheck.worker)
    checkAccess(users.public, entity, accessCheck.public)
  }
}

export function assertUniqueGroups(
  groups: Array<{ name: string; id: string }>,
) {
  const uniqueIds = new Set(groups.map(group => group.id))
  expect(
    uniqueIds.size,
    `Expected ${groups.length} unique groups, but found duplicates`,
  ).toBe(groups.length)
}

function check(
  admin: Access,
  member: Access,
  guest: Access,
  worker: Access,
  pub: Access,
): AccessCheck {
  return { admin, member, guest, worker, public: pub }
}

async function createTestUsers(
  sharedTrip: co.loaded<
    typeof SharedTripEntity,
    { members: true; guests: true; workers: true }
  >,
  admin: Account,
): Promise<TestUsers> {
  const member = await createTestUser("member")
  const guest = await createTestUser("guest")
  const worker = await createTestUser("worker")
  const publicUser = await createTestUser("public")

  sharedTrip.members.addMember(member, "writer")
  sharedTrip.guests.addMember(guest, "reader")
  sharedTrip.workers.addMember(worker, "writer")

  return {
    admin,
    member,
    guest,
    worker,
    public: publicUser,
  }
}

async function buildAccessMatrix(sharedTrip: LoadedSharedTrip) {
  const publicRead = check("rw", "r", "r", "r", "r")
  const publicWrite = check("rw", "w", "w", "w", "w")
  const adminOnly = check("rw", "-", "-", "-", "-")
  const tripAccess = check("rw", "rw", "r", "-", "-")
  const transportAccess = check("rw", "rw", "r", "rw", "-")
  const memberOnly = check("rw", "rw", "-", "-", "-")

  const checks = new Map<CoValue, AccessCheck>()
  checks.set(sharedTrip, publicRead)
  checks.set(sharedTrip.trip, tripAccess)
  checks.set(sharedTrip.requests, publicWrite)
  checks.set(sharedTrip.statuses, adminOnly)

  // Activities (same as Trip)
  checks.set(sharedTrip.trip.activities, tripAccess)
  sharedTrip.trip.activities.forEach(activity => {
    checks.set(activity, tripAccess)
    if (activity.location) {
      checks.set(activity.location, tripAccess)
    }
  })

  // Accommodation (same as Trip)
  checks.set(sharedTrip.trip.accommodation, tripAccess)
  sharedTrip.trip.accommodation.forEach(acc => {
    checks.set(acc, tripAccess)
    if (acc.location) {
      checks.set(acc.location, tripAccess)
    }
  })

  // Transportation (Worker has access)
  checks.set(sharedTrip.trip.transportation, transportAccess)
  await Promise.all(
    sharedTrip.trip.transportation.map(async trans => {
      checks.set(trans, transportAccess)

      switch (trans.type) {
        case "flight": {
          const flight = await trans.$jazz.ensureLoaded({
            resolve: flightResolveQuery,
          })
          checks.set(flight.legs, transportAccess)
          flight.legs.forEach(leg => {
            checks.set(leg, transportAccess)
            checks.set(leg.origin, transportAccess)
            checks.set(leg.origin.location, transportAccess)
            checks.set(leg.destination, transportAccess)
            checks.set(leg.destination.location, transportAccess)
          })
          // PNRs are member-only (no guest, no worker per docs)
          checks.set(flight.pnrs, memberOnly)
          flight.pnrs.forEach(pnr => {
            checks.set(pnr, memberOnly)
          })
          break
        }
        case "train": {
          const train = await trans.$jazz.ensureLoaded({
            resolve: TrainEntity.resolveQuery,
          })
          checks.set(train.legs, transportAccess)
          train.legs.forEach(leg => {
            checks.set(leg, transportAccess)
            checks.set(leg.origin, transportAccess)
            checks.set(leg.origin.location, transportAccess)
            checks.set(leg.destination, transportAccess)
            checks.set(leg.destination.location, transportAccess)
          })
          break
        }
        case "generic": {
          const generic = await trans.$jazz.ensureLoaded({
            resolve: GenericTransportationEntity.resolveQuery,
          })
          checks.set(generic.origin, transportAccess)
          checks.set(generic.destination, transportAccess)
          break
        }
      }
    }),
  )

  // Files (Member-only, no guest)
  checks.set(sharedTrip.trip.files, memberOnly)
  sharedTrip.trip.files.forEach(file => {
    checks.set(file, memberOnly)
  })

  return checks
}

export async function collectTripGroups(sharedTrip: LoadedSharedTrip) {
  const groups: Array<{ name: string; id: string }> = [
    { name: "sharedTrip", id: sharedTrip.$jazz.owner.$jazz.id },
    { name: "trip", id: sharedTrip.trip.$jazz.owner.$jazz.id },
    { name: "requests", id: sharedTrip.requests.$jazz.owner.$jazz.id },
    { name: "statuses", id: sharedTrip.statuses.$jazz.owner.$jazz.id },
    { name: "admins", id: sharedTrip.admins.$jazz.id },
    { name: "members", id: sharedTrip.members.$jazz.id },
    { name: "guests", id: sharedTrip.guests.$jazz.id },
    { name: "workers", id: sharedTrip.workers.$jazz.id },
    { name: "activities", id: sharedTrip.trip.activities.$jazz.owner.$jazz.id },
    {
      name: "accommodation",
      id: sharedTrip.trip.accommodation.$jazz.owner.$jazz.id,
    },
    {
      name: "transportation",
      id: sharedTrip.trip.transportation.$jazz.owner.$jazz.id,
    },
    { name: "files", id: sharedTrip.trip.files.$jazz.owner.$jazz.id },
  ]

  sharedTrip.trip.activities.forEach((activity, index) => {
    groups.push({
      name: `activity[${index}]`,
      id: activity.$jazz.owner.$jazz.id,
    })
    if (activity.location) {
      groups.push({
        name: `activity[${index}].location`,
        id: activity.location.$jazz.owner.$jazz.id,
      })
    }
  })

  sharedTrip.trip.accommodation.forEach((acc, index) => {
    groups.push({
      name: `accommodation[${index}]`,
      id: acc.$jazz.owner.$jazz.id,
    })
    if (acc.location) {
      groups.push({
        name: `accommodation[${index}].location`,
        id: acc.location.$jazz.owner.$jazz.id,
      })
    }
  })

  await Promise.all(
    sharedTrip.trip.transportation.map(async (trans, index) => {
      groups.push({
        name: `transportation[${index}]`,
        id: trans.$jazz.owner.$jazz.id,
      })

      switch (trans.type) {
        case "flight": {
          const flight = await trans.$jazz.ensureLoaded({
            resolve: flightResolveQuery,
          })
          groups.push({
            name: `transportation[${index}].legs`,
            id: flight.legs.$jazz.owner.$jazz.id,
          })
          flight.legs.forEach((leg, legIndex) => {
            groups.push({
              name: `transportation[${index}].leg[${legIndex}]`,
              id: leg.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].origin`,
              id: leg.origin.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].origin.location`,
              id: leg.origin.location.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].destination`,
              id: leg.destination.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].destination.location`,
              id: leg.destination.location.$jazz.owner.$jazz.id,
            })
          })
          groups.push({
            name: `transportation[${index}].pnrs`,
            id: flight.pnrs.$jazz.owner.$jazz.id,
          })
          flight.pnrs.forEach((pnr, pnrIndex) => {
            groups.push({
              name: `transportation[${index}].pnr[${pnrIndex}]`,
              id: pnr.$jazz.owner.$jazz.id,
            })
          })
          break
        }
        case "train": {
          const train = await trans.$jazz.ensureLoaded({
            resolve: TrainEntity.resolveQuery,
          })
          groups.push({
            name: `transportation[${index}].legs`,
            id: train.legs.$jazz.owner.$jazz.id,
          })
          train.legs.forEach((leg, legIndex) => {
            groups.push({
              name: `transportation[${index}].leg[${legIndex}]`,
              id: leg.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].origin`,
              id: leg.origin.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].origin.location`,
              id: leg.origin.location.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].destination`,
              id: leg.destination.$jazz.owner.$jazz.id,
            })
            groups.push({
              name: `transportation[${index}].leg[${legIndex}].destination.location`,
              id: leg.destination.location.$jazz.owner.$jazz.id,
            })
          })
          break
        }
        case "generic": {
          const generic = await trans.$jazz.ensureLoaded({
            resolve: GenericTransportationEntity.resolveQuery,
          })
          groups.push({
            name: `transportation[${index}].origin`,
            id: generic.origin.$jazz.owner.$jazz.id,
          })
          groups.push({
            name: `transportation[${index}].destination`,
            id: generic.destination.$jazz.owner.$jazz.id,
          })
          break
        }
      }
    }),
  )

  sharedTrip.trip.files.forEach((file, index) => {
    groups.push({ name: `file[${index}]`, id: file.$jazz.owner.$jazz.id })
  })

  return groups
}

export async function assertTripPermissions(stid: string, admin: Account) {
  const sharedTrip = await loadSharedTrip(stid)

  assertUniqueGroups(await collectTripGroups(sharedTrip))
  assertRoleInGroup(sharedTrip.admins, admin, "admin")

  const users = await createTestUsers(sharedTrip, admin)
  const checks = await buildAccessMatrix(sharedTrip)

  assertAccessMatrix(users, checks)
}
