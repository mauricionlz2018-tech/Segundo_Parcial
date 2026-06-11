import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === "limpiar-sesiones-usuarios") {
      await pool.query("DELETE FROM user_sesiones")
      return NextResponse.json({
        success: true,
        message: "Todos los registros de sesiones de usuarios han sido eliminados.",
      })
    }

    return NextResponse.json({ error: "Acción no válida." }, { status: 400 })
  } catch (error) {
    console.error("Error en limpiar:", error)
    return NextResponse.json(
      { error: "Error al limpiar datos" },
      { status: 500 }
    )
  }
}