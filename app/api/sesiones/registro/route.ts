import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"

export const runtime = "nodejs"

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return await getUserBySessionToken(token)
}

// GET - obtener sesiones registradas del usuario
export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const result = await pool.query(
    `SELECT s.*, us.registered_at 
     FROM sesiones s
     INNER JOIN user_sesiones us ON s.id = us.sesion_id
     WHERE us.user_id = $1
     ORDER BY s.dia, s.hora_inicio`,
    [user.id]
  )

  return NextResponse.json({ data: result.rows || [] })
}

// POST - registrarse en una sesión
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const sesionId = String(body?.sesionId ?? "").trim()

  if (!sesionId) {
    return NextResponse.json({ error: "ID de sesión requerido." }, { status: 400 })
  }

  try {
    // Verificar que la sesión existe
    const sesionResult = await pool.query(
      "SELECT id FROM sesiones WHERE id = $1",
      [sesionId]
    )
    if (!sesionResult.rows || sesionResult.rows.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 })
    }

    // Verificar si ya está registrado
    const registroResult = await pool.query(
      "SELECT id FROM user_sesiones WHERE user_id = $1 AND sesion_id = $2",
      [user.id, sesionId]
    )
    if (registroResult.rows && registroResult.rows.length > 0) {
      return NextResponse.json({ error: "Ya estás registrado en esta sesión." }, { status: 409 })
    }

    // Registrar usuario en sesión
    const id = crypto.randomUUID()
    await pool.query(
      "INSERT INTO user_sesiones (id, user_id, sesion_id) VALUES ($1, $2, $3)",
      [id, user.id, sesionId]
    )

    // Incrementar cupos ocupados
    await pool.query(
      "UPDATE sesiones SET cupos_ocupados = cupos_ocupados + 1 WHERE id = $1",
      [sesionId]
    )

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error("Error registrando sesión:", error)
    return NextResponse.json({ error: "Error al registrar sesión." }, { status: 500 })
  }
}
