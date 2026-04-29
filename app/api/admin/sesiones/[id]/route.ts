import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"
import type { ResultSetHeader } from "mysql2/promise"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const titulo = String(body?.titulo ?? "").trim()
  const ponente = String(body?.ponente ?? "").trim()
  const dia = String(body?.dia ?? "").trim()
  const horaInicio = String(body?.hora_inicio ?? "").trim()
  const horaFin = String(body?.hora_fin ?? "").trim()
  const tipo = String(body?.tipo ?? "").trim()
  const lugar = String(body?.lugar ?? "").trim()
  const cuposTotal = Number(body?.cupos_total ?? 0)
  const descripcion = String(body?.descripcion ?? "").trim()

  if (!titulo || !ponente) {
    return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 })
  }

  await pool.execute<ResultSetHeader>(
    "update sesiones set titulo = ?, ponente = ?, dia = ?, hora_inicio = ?, hora_fin = ?, tipo = ?, lugar = ?, cupos_total = ?, descripcion = ? where id = ?",
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
      params.id,
    ]
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  await pool.execute<ResultSetHeader>("delete from sesiones where id = ?", [params.id])
  return NextResponse.json({ ok: true })
}
