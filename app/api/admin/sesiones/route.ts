import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import supabase from "@/lib/db"

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

  const { data, error } = await supabase
    .from("sesiones")
    .select(
      "id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, foto_ponente, perfil_profesional, afiliacion, biografia, created_at"
    )
    .order("dia", { ascending: true })
    .order("hora_inicio", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Error al obtener sesiones." }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const titulo = String(body?.titulo ?? "").trim()
  const ponente = String(body?.ponente ?? "").trim()

  if (!titulo || !ponente) {
    return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("sesiones")
    .insert({
      titulo,
      ponente,
      dia: String(body?.dia ?? "").trim(),
      hora_inicio: String(body?.hora_inicio ?? "").trim(),
      hora_fin: String(body?.hora_fin ?? "").trim(),
      tipo: String(body?.tipo ?? "Conferencia").trim(),
      lugar: String(body?.lugar ?? "").trim(),
      cupos_total: Number(body?.cupos_total ?? 0),
      cupos_ocupados: 0,
      descripcion: String(body?.descripcion ?? "").trim() || null,
      foto_ponente: body?.foto_ponente ?? null,
      perfil_profesional: String(body?.perfil_profesional ?? "").trim() || null,
      afiliacion: String(body?.afiliacion ?? "").trim() || null,
      biografia: String(body?.biografia ?? "").trim() || null,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: "Error al crear sesion." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
