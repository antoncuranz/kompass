import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const schema = z.object({
  JAZZ_SYNC_URL: z.string().nonempty().default("ws://127.0.0.1:4200"),
  JAZZ_WORKER_ACCOUNT: z.string().nonempty(),
  JAZZ_WORKER_SECRET: z.string().nonempty(),
  VAPID_SUBJECT: z.string().nonempty(),
  VAPID_PUBLIC_KEY: z.string().nonempty(),
  VAPID_PRIVATE_KEY: z.string().nonempty(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(z.treeifyError(parsed.error), null, 4),
  )
  process.exit(1)
}

export default parsed.data
