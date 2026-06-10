import { NextResponse } from "next/server"
import { cookies } from "next/headers"
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

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { action } = body

  if (action === "limpiar-sesiones-usuarios") {
    const { error } = await supabase.from("user_sesiones").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      return NextResponse.json({ error: "Error al limpiar datos" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Todos los registros de sesiones de usuarios han sido eliminados.",
    })
  }

  return NextResponse.json({ error: "Accion no valida." }, { status: 400 })
}
