import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE, hashPassword } from "@/lib/auth"
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
    .from("users")
    .select("id, email, username, full_name, carrera, role, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Error al obtener usuarios." }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const userId = body?.id

  if (!userId) {
    return NextResponse.json({ error: "ID de usuario requerido." }, { status: 400 })
  }

  if (userId === admin.id) {
    return NextResponse.json({ error: "No puedes eliminar tu propia cuenta." }, { status: 400 })
  }

  // sessions se elimina en cascada por FK
  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) {
    return NextResponse.json({ error: "Error al eliminar usuario." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "Usuario eliminado exitosamente." })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { email, username, full_name, carrera, password, role } = body

  if (!email || !username || !full_name || !password || !role) {
    return NextResponse.json(
      { error: "Email, usuario, nombre, contrasena y rol son requeridos." },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 6 caracteres." }, { status: 400 })
  }

  if (role !== "admin" && role !== "alumno") {
    return NextResponse.json({ error: "El rol debe ser 'admin' o 'alumno'." }, { status: 400 })
  }

  const { count: emailCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("email", email)

  if ((emailCount ?? 0) > 0) {
    return NextResponse.json({ error: "El email ya esta registrado." }, { status: 400 })
  }

  const { count: usernameCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("username", username)

  if ((usernameCount ?? 0) > 0) {
    return NextResponse.json({ error: "El usuario ya esta registrado." }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)

  const { data, error } = await supabase
    .from("users")
    .insert({ email, username, full_name, carrera: carrera || null, password_hash: passwordHash, role })
    .select("id, email, username, full_name, carrera, role")
    .single()

  if (error) {
    return NextResponse.json({ error: "Error al crear el usuario." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "Usuario creado exitosamente.", user: data }, { status: 201 })
}
