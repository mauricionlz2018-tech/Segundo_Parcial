import mysql from "mysql2/promise"

type GlobalPool = typeof globalThis & { mysqlPool?: mysql.Pool }

const globalForMysql = globalThis as GlobalPool

const pool =
  globalForMysql.mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT ?? 4000),
    connectionLimit: 10,
    waitForConnections: true,
    ssl: {
      rejectUnauthorized: true,
    },
  })

if (process.env.NODE_ENV !== "production") {
  globalForMysql.mysqlPool = pool
}

export default pool

export async function query<T = mysql.RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const [rows] = await pool.execute(sql, params)
  return rows as T
}
