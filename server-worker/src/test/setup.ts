import { Layer, Redacted } from "effect"
import { beforeEach, onTestFinished } from "vitest"
import { AppConfig } from "../config"
import { startSyncServer } from "jazz-run/startSyncServer"
import { createWorkerAccount } from "jazz-run/createWorkerAccount"

export let AppConfigTest: Layer.Layer<AppConfig, never, never>

async function setupSyncServer(
  defaultHost: string = "127.0.0.1",
  defaultPort: string | undefined = undefined,
) {
  const server = await startSyncServer({
    host: defaultHost,
    port: defaultPort,
    inMemory: true,
    db: "sync-db/storage.db",
  })

  const port = (server.address() as { port: number }).port.toString()

  onTestFinished(() => {
    server.close()
  })

  return { server, peer: `ws://${defaultHost}:${port}` }
}

beforeEach(async () => {
  const { peer } = await setupSyncServer()
  const { accountID, agentSecret } = await createWorkerAccount({
    name: "Test Worker",
    peer,
  })

  AppConfigTest = Layer.succeed(AppConfig, {
    jazzSyncUrl: peer,
    jazzAccountId: accountID,
    jazzAccountSecret: Redacted.make(agentSecret),
    vapidSubject: "mailto:test@test.com",
    vapidPublicKey: "test-public-key",
    vapidPrivateKey: Redacted.make("test-private-key"),
    transportationApiUrl: "http://test:8080/api/v1",
  })
})
