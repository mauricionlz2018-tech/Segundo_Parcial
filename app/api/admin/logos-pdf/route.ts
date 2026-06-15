import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"
import crypto from "crypto"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logos_pdf (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      imagen_base64 TEXT NOT NULL,
      activo BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  await ensureTable()
  const result = await pool.query("SELECT id, nombre, imagen_base64, activo, created_at FROM logos_pdf ORDER BY created_at ASC")
  return NextResponse.json({ data: result.rows })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  await ensureTable()
  const body = await request.json().catch(() => null)
  const nombre = String(body?.nombre ?? "").trim()
  const imagen_base64 = String(body?.imagen_base64 ?? "").trim()
  if (!nombre || !imagen_base64) {
    return NextResponse.json({ error: "Nombre e imagen son requeridos." }, { status: 400 })
  }
  const id = crypto.randomUUID()
  await pool.query(
    "INSERT INTO logos_pdf (id, nombre, imagen_base64, activo) VALUES ($1, $2, $3, true)",
    [id, nombre, imagen_base64]
  )
  return NextResponse.json({ ok: true, id })
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  const body = await request.json().catch(() => null)
  const id = String(body?.id ?? "")
  const activo = Boolean(body?.activo)
  if (!id) return NextResponse.json({ error: "id requerido." }, { status: 400 })
  await pool.query("UPDATE logos_pdf SET activo = $1 WHERE id = $2", [activo, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id requerido." }, { status: 400 })
  await pool.query("DELETE FROM logos_pdf WHERE id = $1", [id])
  return NextResponse.json({ ok: true })
}