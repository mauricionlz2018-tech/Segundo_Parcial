import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import { query } from "@/lib/db"
import { v4 as uuid } from "uuid"

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
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  try {
    const espacios = await query(
      "SELECT id, nombre, descripcion, capacidad_maxima, created_at FROM espacios ORDER BY created_at DESC"
    )
    return NextResponse.json({ data: espacios || [] })
  } catch (error) {
    console.error("Error al obtener espacios:", error)
    return NextResponse.json({ error: "Error al obtener espacios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  try {
    const body = await request.json().catch(() => null)
    const nombre = String(body?.nombre ?? "").trim()
    const descripcion = String(body?.descripcion ?? "").trim()
    const capacidad_maxima = Number(body?.capacidad_maxima ?? 50)

    if (!nombre) return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 })
    if (capacidad_maxima < 1) return NextResponse.json({ error: "La capacidad debe ser mayor a 0." }, { status: 400 })

    const id = uuid()
    await query(
      `INSERT INTO espacios (id, nombre, descripcion, capacidad_maxima) VALUES ($1, $2, $3, $4)`,
      [id, nombre, descripcion || null, capacidad_maxima]
    )

    return NextResponse.json({ ok: true, message: "Espacio creado exitosamente.", id })
  } catch (error) {
    console.error("Error al crear espacio:", error)
    return NextResponse.json({ error: "Error al crear el espacio" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  try {
    const body = await request.json().catch(() => null)
    const id = body?.id
    if (!id) return NextResponse.json({ error: "ID requerido." }, { status: 400 })

    await query("DELETE FROM espacios WHERE id = $1", [id])
    return NextResponse.json({ ok: true, message: "Espacio eliminado exitosamente." })
  } catch (error) {
    console.error("Error al eliminar espacio:", error)
    return NextResponse.json({ error: "Error al eliminar el espacio" }, { status: 500 })
  }
}