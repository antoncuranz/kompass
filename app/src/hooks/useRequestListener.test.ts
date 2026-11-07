// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { useRequestListener } from "./useRequestListener"

const mocks = vi.hoisted(() => {
  const remove = vi.fn()
  const requests = {
    trip: { $isLoaded: true, status: "approved" },
    $jazz: { delete: remove, has: () => true },
  }
  const account = {
    $jazz: {
      id: "account",
      ensureLoaded: vi.fn().mockResolvedValue({ root: { requests } }),
    },
  }
  return {
    remove,
    account,
    load: vi.fn(),
    add: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    approved: [{ sharedTripId: "trip", status: "approved" }],
  }
})
vi.mock("jazz-tools/react", () => ({ useAccount: () => mocks.approved }))
vi.mock("@/repo/user/schema", () => ({
  UserAccount: { getMe: () => mocks.account },
}))
vi.mock("@/repo/trip/schema", () => ({
  SharedTripEntity: { load: mocks.load },
}))
vi.mock("@/repo/common/schema", () => ({
  JoinRequestEntity: { resolveQuery: {} },
}))
vi.mock("@/lib/collaboration", () => ({ addTripToCurrentUser: mocks.add }))
vi.mock("sonner", () => ({
  toast: { success: mocks.success, error: mocks.error },
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  mocks.add.mockResolvedValue(true)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

it("retries when approval arrives before permissions and only then removes the request", async () => {
  mocks.load
    .mockResolvedValueOnce({ $isLoaded: false })
    .mockResolvedValue({ $isLoaded: true, trip: { name: "Shared" } })
  renderHook(useRequestListener)
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(mocks.remove).not.toHaveBeenCalled()
  expect(mocks.add).not.toHaveBeenCalled()
  await act(() => vi.advanceTimersByTimeAsync(3000))
  expect(mocks.add).toHaveBeenCalledWith("trip")
  expect(mocks.remove).toHaveBeenCalledWith("trip")
  expect(mocks.success).toHaveBeenCalledTimes(1)
})

it("keeps the request after an add failure and retries without a duplicate success toast", async () => {
  mocks.load.mockResolvedValue({ $isLoaded: true, trip: { name: "Shared" } })
  mocks.add
    .mockRejectedValueOnce(new Error("Temporary failure"))
    .mockResolvedValue(false)
  renderHook(useRequestListener)
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(mocks.remove).not.toHaveBeenCalled()
  await act(() => vi.advanceTimersByTimeAsync(3000))
  expect(mocks.remove).toHaveBeenCalledWith("trip")
  expect(mocks.success).not.toHaveBeenCalled()
})

it("cancels retries on unmount", async () => {
  mocks.load.mockResolvedValue({ $isLoaded: false })
  const { unmount } = renderHook(useRequestListener)
  await act(() => vi.advanceTimersByTimeAsync(0))
  unmount()
  await act(() => vi.advanceTimersByTimeAsync(6000))
  expect(mocks.load).toHaveBeenCalledTimes(1)
})
