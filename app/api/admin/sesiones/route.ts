import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool, { query } from "@/lib/db"
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

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const rows = await query(
    "select id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, foto_ponente, perfil_profesional, afiliacion, biografia, created_at from sesiones order by dia, hora_inicio"
  )

  return NextResponse.json({ data: rows })
}

export async function POST(request: Request) {
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
  const fotoPonente = body?.foto_ponente ?? null
  const perfilProfesional = String(body?.perfil_profesional ?? "").trim() || null
  const afiliacion = String(body?.afiliacion ?? "").trim() || null
  const biografia = String(body?.biografia ?? "").trim() || null

  if (!titulo || !ponente) {
    return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 })
  }

  const id = crypto.randomUUID()
  await pool.execute<ResultSetHeader>(
    "insert into sesiones (id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, foto_ponente, perfil_profesional, afiliacion, biografia) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      titulo,
      ponente,
      dia,
      horaInicio,
      horaFin,
      tipo,
      lugar,
      cuposTotal,
      0,
      descripcion || null,
      fotoPonente,
      perfilProfesional,
      afiliacion,
      biografia,
    ]
  )

  return NextResponse.json({ ok: true, id })
}
