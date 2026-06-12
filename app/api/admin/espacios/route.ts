import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import { query } from "@/lib/db"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const espacios = await query(
      "SELECT id, nombre, descripcion, capacidad_maxima, created_at FROM espacios ORDER BY created_at DESC"
    )
    return NextResponse.json({ data: espacios || [] })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al obtener espacios" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const id = body?.id

    if (!id) {
      return NextResponse.json({ error: "ID de espacio requerido." }, { status: 400 })
    }

    await query("DELETE FROM espacios WHERE id = $1", [id])

    return NextResponse.json({ ok: true, message: "Espacio eliminado exitosamente." })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al eliminar espacio" }, { status: 500 })
  }
}