import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool, { query } from "@/lib/db"

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
    "SELECT id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, foto_ponente, perfil_profesional, afiliacion, biografia, created_at FROM sesiones ORDER BY dia, hora_inicio"
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

  // Validar que no haya choque de horarios en el mismo lugar y día
  if (dia && horaInicio && horaFin && lugar) {
    const traslapes = await pool.query(
      `SELECT id, titulo, hora_inicio::text, hora_fin::text FROM sesiones
       WHERE dia = $1 AND lugar = $2
         AND hora_inicio < $3::time AND hora_fin > $4::time`,
      [dia, lugar, horaFin, horaInicio]
    )

    if (traslapes.rows.length > 0) {
      const conflicto = traslapes.rows[0]
      return NextResponse.json(
        {
          error: `Conflicto de horario: ya existe la sesión "${conflicto.titulo}" en "${lugar}" de ${conflicto.hora_inicio} a ${conflicto.hora_fin}. No se pueden tener dos sesiones en el mismo lugar y horario.`,
        },
        { status: 409 }
      )
    }
  }

  const id = crypto.randomUUID()
  await pool.query(
    "INSERT INTO sesiones (id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, foto_ponente, perfil_profesional, afiliacion, biografia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)",
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