import crypto from "crypto"
import bcrypt from "bcryptjs"
import pool, { query } from "@/lib/db"
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise"

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
    "select id, email, username, full_name, role, carrera, created_at, password_hash from users where email = ? or username = ? limit 1",
    [value, value]
  )
  return rows[0] ?? null
}

export async function findUserById(id: string) {
  const rows = await query<UserRow[]>(
    "select id, email, username, full_name, role, carrera, created_at, password_hash from users where id = ? limit 1",
    [id]
  )
  return rows[0] ?? null
}

export async function isUsernameTaken(username: string) {
  const rows = await query<RowDataPacket[]>(
    "select 1 from users where username = ? limit 1",
    [username]
  )
  return rows.length > 0
}

export async function isEmailTaken(email: string) {
  const rows = await query<RowDataPacket[]>(
    "select 1 from users where email = ? limit 1",
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
  await pool.execute<ResultSetHeader>(
    "insert into users (id, email, username, full_name, role, carrera, password_hash) values (?, ?, ?, ?, ?, ?, ?)",
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

  await pool.execute<ResultSetHeader>(
    "insert into sessions (id, user_id, token_hash, expires_at) values (?, ?, ?, ?)",
    [sessionId, userId, tokenHash, expiresAt]
  )

  return { token, expiresAt }
}

export async function getUserBySessionToken(token: string) {
  const tokenHash = hashToken(token)
  const rows = await query<UserRow[]>(
    "select u.id, u.email, u.username, u.full_name, u.role, u.carrera, u.created_at, u.password_hash from sessions s join users u on u.id = s.user_id where s.token_hash = ? and s.expires_at > now() limit 1",
    [tokenHash]
  )

  const user = rows[0]
  if (!user) return null
  const { password_hash: _ignored, ...rest } = user
  return rest
}

export async function deleteSession(token: string) {
  const tokenHash = hashToken(token)
  await pool.execute<ResultSetHeader>("delete from sessions where token_hash = ?", [tokenHash])
}

export async function createPasswordReset(userId: string) {
  const token = crypto.randomBytes(24).toString("base64url")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000)
  const resetId = crypto.randomUUID()

  await pool.execute<ResultSetHeader>(
    "insert into password_resets (id, user_id, token_hash, expires_at) values (?, ?, ?, ?)",
    [resetId, userId, tokenHash, expiresAt]
  )

  return token
}

export async function resetPasswordWithToken(token: string, newPasswordHash: string) {
  const tokenHash = hashToken(token)
  const rows = await query<RowDataPacket[]>(
    "select user_id from password_resets where token_hash = ? and expires_at > now() limit 1",
    [tokenHash]
  )
  const row = rows[0]
  if (!row?.user_id) return false

  await pool.execute<ResultSetHeader>("update users set password_hash = ? where id = ?", [
    newPasswordHash,
    row.user_id,
  ])
  await pool.execute<ResultSetHeader>("delete from password_resets where user_id = ?", [row.user_id])
  return true
}
