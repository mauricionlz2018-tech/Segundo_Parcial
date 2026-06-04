import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"
import type { ResultSetHeader } from "mysql2/promise"

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
     WHERE us.user_id = ?
     ORDER BY s.dia, s.hora_inicio`,
    [user.id]
  )

  return NextResponse.json({ data: result[0] || [] })
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
    const [sesionResult] = await pool.query(
      "SELECT id FROM sesiones WHERE id = ?",
      [sesionId]
    )
    if (!sesionResult || sesionResult.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 })
    }

    const [registroResult] = await pool.query(
      "SELECT id FROM user_sesiones WHERE user_id = ? AND sesion_id = ?",
      [user.id, sesionId]
    )
    if (registroResult[0] && registroResult[0].length > 0) {
      return NextResponse.json({ error: "Ya estás registrado en esta sesión." }, { status: 409 })
    }

    // Registrar usuario en sesión
    const id = crypto.randomUUID()
    await pool.execute<ResultSetHeader>(
      "INSERT INTO user_sesiones (id, user_id, sesion_id) VALUES (?, ?, ?)",
      [id, user.id, sesionId]
    )

    // Incrementar cupos ocupados
    await pool.execute(
      "UPDATE sesiones SET cupos_ocupados = cupos_ocupados + 1 WHERE id = ?",
      [sesionId]
    )

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    console.error("Error registrando sesión:", error)
    return NextResponse.json({ error: "Error al registrar sesión." }, { status: 500 })
  }
}
