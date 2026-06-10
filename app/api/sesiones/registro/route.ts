import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import supabase from "@/lib/db"

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

  const { data, error } = await supabase
    .from("user_sesiones")
    .select("registered_at, sesiones(*)")
    .eq("user_id", user.id)
    .order("sesiones(dia)", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Error al obtener sesiones." }, { status: 500 })
  }

  const sesiones = (data ?? []).map((row: any) => ({
    ...row.sesiones,
    registered_at: row.registered_at,
  }))

  return NextResponse.json({ data: sesiones })
}

// POST - registrarse en una sesion
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const sesionId = String(body?.sesionId ?? "").trim()

  if (!sesionId) {
    return NextResponse.json({ error: "ID de sesion requerido." }, { status: 400 })
  }

  const { count: sesionCount } = await supabase
    .from("sesiones")
    .select("id", { count: "exact", head: true })
    .eq("id", sesionId)

  if (!sesionCount) {
    return NextResponse.json({ error: "Sesion no encontrada." }, { status: 404 })
  }

  const { count: yainscrito } = await supabase
    .from("user_sesiones")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("sesion_id", sesionId)

  if (yainscrito && yainscrito > 0) {
    return NextResponse.json({ error: "Ya estas registrado en esta sesion." }, { status: 409 })
  }

  const { data: inscripcion, error: insError } = await supabase
    .from("user_sesiones")
    .insert({ user_id: user.id, sesion_id: sesionId })
    .select("id")
    .single()

  if (insError) {
    return NextResponse.json({ error: "Error al registrar sesion." }, { status: 500 })
  }

  await supabase.rpc("incrementar_cupos", { sesion_id: sesionId })

  return NextResponse.json({ ok: true, id: inscripcion.id })
}
