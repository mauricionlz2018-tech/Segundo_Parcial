import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const email = "admin.ues"
const password = "Admin2025!"
const username = "admin.ues"
const fullName = "Administrador UES"
const role = "admin"

const pool = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT ?? 3306),
  connectionLimit: 3,
})

const [existing] = await pool.execute("select id from users where email = ? or username = ? limit 1", [
  email,
  username,
])

if (Array.isArray(existing) && existing.length > 0) {
  console.log("Admin user already exists.")
  process.exit(0)
}

const passwordHash = await bcrypt.hash(password, 10)
const id = crypto.randomUUID()

await pool.execute(
  "insert into users (id, email, username, full_name, role, password_hash) values (?, ?, ?, ?, ?, ?)",
  [id, email, username, fullName, role, passwordHash]
)

console.log("Admin user created:", username)
process.exit(0)
