import { Pool } from "pg"

type GlobalPool = typeof globalThis & { pgPool?: Pool }

const globalForPg = globalThis as GlobalPool

const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool
}

export default pool

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}
