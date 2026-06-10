import crypto from "crypto"
import bcrypt from "bcryptjs"
import supabase from "@/lib/db"

export const SESSION_COOKIE = "ues_session"
const SESSION_TTL_DAYS = 30
const RESET_TTL_MINUTES = 60

export type DbUser = {
  id: string
  email: string
  username: string
  full_name: string | null
  role: string
  carrera: string | null
  created_at: string
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function findUserByEmailOrUsername(value: string): Promise<(DbUser & { password_hash: string }) | null> {
  // Buscar primero por email
  const { data: byEmail } = await supabase
    .from("users")
    .select("id, email, username, full_name, role, carrera, created_at, password_hash")
    .eq("email", value)
    .limit(1)
    .maybeSingle()

  if (byEmail) return byEmail as DbUser & { password_hash: string }

  // Si no se encontró por email, buscar por username
  const { data: byUsername } = await supabase
    .from("users")
    .select("id, email, username, full_name, role, carrera, created_at, password_hash")
    .eq("username", value)
    .limit(1)
    .maybeSingle()

  if (byUsername) return byUsername as DbUser & { password_hash: string }

  return null
}

export async function findUserById(id: string): Promise<(DbUser & { password_hash: string }) | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, username, full_name, role, carrera, created_at, password_hash")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return data as DbUser & { password_hash: string }
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("username", username)
  return (count ?? 0) > 0
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
  return (count ?? 0) > 0
}

export async function createUser(input: {
  email: string
  username: string
  fullName: string
  passwordHash: string
  role?: string
  carrera?: string
}): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      email: input.email,
      username: input.username,
      full_name: input.fullName,
      role: input.role ?? "alumno",
      carrera: input.carrera ?? null,
      password_hash: input.passwordHash,
    })
    .select("id, email, username, full_name, role, carrera, created_at")
    .single()

  if (error || !data) return null
  return data as DbUser
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("base64url")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)

  const { error } = await supabase.from("sessions").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw new Error(`Error creando sesion: ${error.message}`)

  return { token, expiresAt }
}

export async function getUserBySessionToken(token: string): Promise<DbUser | null> {
  const tokenHash = hashToken(token)

  const { data, error } = await supabase
    .from("sessions")
    .select("users(id, email, username, full_name, role, carrera, created_at)")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .single()

  if (error || !data?.users) return null
  return data.users as unknown as DbUser
}

export async function deleteSession(token: string): Promise<void> {
  const tokenHash = hashToken(token)
  await supabase.from("sessions").delete().eq("token_hash", tokenHash)
}

export async function createPasswordReset(userId: string): Promise<string> {
  const token = crypto.randomBytes(24).toString("base64url")
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000)

  await supabase.from("password_resets").insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  return token
}

export async function resetPasswordWithToken(token: string, newPasswordHash: string): Promise<boolean> {
  const tokenHash = hashToken(token)

  const { data, error } = await supabase
    .from("password_resets")
    .select("user_id")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error || !data?.user_id) return false

  await supabase.from("users").update({ password_hash: newPasswordHash }).eq("id", data.user_id)
  await supabase.from("password_resets").delete().eq("user_id", data.user_id)
  return true
}
