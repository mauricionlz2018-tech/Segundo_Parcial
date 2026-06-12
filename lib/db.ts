import { Pool } from "pg"

type GlobalPool = typeof globalThis & { pgPool?: Pool }

const globalForPg = globalThis as GlobalPool

const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool
}

export default pool

export async function query<T = Record<string, unknown>[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  // PostgreSQL usa $1, $2... en lugar de ?
  // Esta función convierte automáticamente los ? a $1, $2, ...
  let paramIndex = 0
  const pgSql = sql.replace(/\?/g, () => `$${++paramIndex}`)

  const result = await pool.query(pgSql, params)
  return result.rows as T
}
