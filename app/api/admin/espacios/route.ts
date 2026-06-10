import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import supabase from "@/lib/db"

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
    .from("espacios")
    .select("id, nombre, descripcion, capacidad_maxima, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Error al obtener espacios" }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const id = body?.id

  if (!id) {
    return NextResponse.json({ error: "ID de espacio requerido." }, { status: 400 })
  }

  const { error } = await supabase.from("espacios").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Error al eliminar espacio" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "Espacio eliminado exitosamente." })
}
