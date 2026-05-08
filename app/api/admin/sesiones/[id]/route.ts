import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import { query } from "@/lib/db"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await params

  const rows = await query(
    "select id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, foto_ponente, created_at from sesiones where id = ?",
    [id]
  )

  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 })
  }

  return NextResponse.json({ data: rows[0] })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => null)

  // Validar que la sesión existe
  const existing = await query(
    "select id from sesiones where id = ?",
    [id]
  )

  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 })
  }

  const titulo = String(body?.titulo ?? "").trim()
  const ponente = String(body?.ponente ?? "").trim()
  const dia = String(body?.dia ?? "").trim()
  const horaInicio = String(body?.hora_inicio ?? "").trim()
  const horaFin = String(body?.hora_fin ?? "").trim()
  const tipo = String(body?.tipo ?? "Conferencia").trim()
  const lugar = String(body?.lugar ?? "").trim()
  const cuposTotal = Number(body?.cupos_total ?? 0)
  const descripcion = String(body?.descripcion ?? "").trim()
  const fotoPonente = body?.foto_ponente ?? null

  if (!titulo || !ponente) {
    return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 })
  }

  await query(
    "update sesiones set titulo = ?, ponente = ?, dia = ?, hora_inicio = ?, hora_fin = ?, tipo = ?, lugar = ?, cupos_total = ?, descripcion = ?, foto_ponente = ? where id = ?",
    [
      titulo,
      ponente,
      dia,
      horaInicio,
      horaFin,
      tipo,
      lugar,
      cuposTotal,
      descripcion || null,
      fotoPonente,
      id,
    ]
  )

  return NextResponse.json({ ok: true, message: "Sesión actualizada exitosamente" })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await params

  // Validar que la sesión existe
  const existing = await query(
    "select id from sesiones where id = ?",
    [id]
  )

  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 })
  }

  await query("delete from sesiones where id = ?", [id])

  return NextResponse.json({ ok: true, message: "Sesión eliminada exitosamente" })
}
