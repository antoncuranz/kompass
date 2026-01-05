import { createJazzTestAccount, setupJazzTestSync } from "jazz-tools/testing"
import { UserAccount } from "@/repo/user/schema"

export async function createTestUser(
  role: "admin" | "member" | "guest" | "worker" | "public",
  isCurrentActiveAccount = false,
) {
  return createJazzTestAccount({
    AccountSchema: UserAccount,
    isCurrentActiveAccount,
    creationProps: {
      name: `Test ${role} ${Math.random().toString(36).slice(2)}`,
    },
  })
}

export function setupTestEnvironment() {
  return setupJazzTestSync()
}
