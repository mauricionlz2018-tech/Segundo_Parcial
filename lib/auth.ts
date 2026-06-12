import crypto from "crypto"
import bcrypt from "bcryptjs"
import pool, { query } from "@/lib/db"

export const SESSION_COOKIE = "ues_session"
const SESSION_TTL_DAYS = 30
const RESET_TTL_MINUTES = 60

type UserRow = {
  id: string
  email: string
  username: string
  full_name: string | null
  role: string
  carrera: string | null
  created_at: string
  password_hash: string
}

export type DbUser = Omit<UserRow, "password_hash">

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function findUserByEmailOrUsername(value: string) {
  const rows = await query<UserRow[]>(
    "SELECT id, email, username, full_name, role, carrera, created_at, password_hash FROM users WHERE email = $1 OR username = $2 LIMIT 1",
    [value, value]
  )
  return rows[0] ?? null
}

export async function findUserById(id: string) {
  const rows = await query<UserRow[]>(
    "SELECT id, email, username, full_name, role, carrera, created_at, password_hash FROM users WHERE id = $1 LIMIT 1",
    [id]
  )
  return rows[0] ?? null
}

export async function isUsernameTaken(username: string) {
  const rows = await query<Record<string, unknown>[]>(
    "SELECT 1 FROM users WHERE username = $1 LIMIT 1",
    [username]
  )
  return rows.length > 0
}

export async function isEmailTaken(email: string) {
  const rows = await query<Record<string, unknown>[]>(
    "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
    [email]
  )
  return rows.length > 0
}

export async function createUser(input: {
  email: string
  username: string
  fullName: string
  passwordHash: string
  role?: string
  carrera?: string
}) {
  const id = crypto.randomUUID()
  await pool.query(
    "INSERT INTO users (id, email, username, full_name, role, carrera, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      id,
      input.email,
      input.username,
      input.fullName,
      input.role ?? "alumno",
      input.carrera ?? null,
      input.passwordHash,
    ]
  )

  const user = await findUserById(id)
  if (!user) return null
  const { password_hash: _ignored, ...rest } = user
  return rest
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const sessionId = crypto.randomUUID()

  await pool.query(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [sessionId, userId, tokenHash, expiresAt]
  )

  return { token, expiresAt }
}

export async function getUserBySessionToken(token: string) {
  const tokenHash = hashToken(token)
  const rows = await query<UserRow[]>(
    "SELECT u.id, u.email, u.username, u.full_name, u.role, u.carrera, u.created_at, u.password_hash FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > NOW() LIMIT 1",
    [tokenHash]
  )

  const user = rows[0]
  if (!user) return null
  const { password_hash: _ignored, ...rest } = user
  return rest
}

export async function deleteSession(token: string) {
  const tokenHash = hashToken(token)
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash])
}

export async function createPasswordReset(userId: string) {
  const token = crypto.randomBytes(24).toString("base64url")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000)
  const resetId = crypto.randomUUID()

  await pool.query(
    "INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [resetId, userId, tokenHash, expiresAt]
  )

  return token
}

export async function resetPasswordWithToken(token: string, newPasswordHash: string) {
  const tokenHash = hashToken(token)
  const rows = await query<{ user_id: string }[]>(
    "SELECT user_id FROM password_resets WHERE token_hash = $1 AND expires_at > NOW() LIMIT 1",
    [tokenHash]
  )
  const row = rows[0]
  if (!row?.user_id) return false

  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    newPasswordHash,
    row.user_id,
  ])
  await pool.query("DELETE FROM password_resets WHERE user_id = $1", [row.user_id])
  return true
}
