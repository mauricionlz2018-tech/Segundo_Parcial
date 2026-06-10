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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id: userId } = await params
  const body = await request.json().catch(() => null)
  const { email, username, full_name, carrera, role, password } = body

  if (!userId) {
    return NextResponse.json({ error: "ID de usuario requerido." }, { status: 400 })
  }

  if (role !== "admin" && role !== "alumno") {
    return NextResponse.json({ error: "El rol debe ser 'admin' o 'alumno'." }, { status: 400 })
  }

  const { count: existsCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("id", userId)

  if (!existsCount) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 })
  }

  if (email) {
    const { count: emailCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .neq("id", userId)

    if ((emailCount ?? 0) > 0) {
      return NextResponse.json({ error: "El email ya esta registrado." }, { status: 400 })
    }
  }

  if (username) {
    const { count: usernameCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("username", username)
      .neq("id", userId)

    if ((usernameCount ?? 0) > 0) {
      return NextResponse.json({ error: "El usuario ya esta registrado." }, { status: 400 })
    }
  }

  const updateData: Record<string, unknown> = {
    email,
    username,
    full_name,
    carrera: carrera || null,
    role,
  }

  if (password && String(password).trim().length > 0) {
    const pwd = String(password).trim()
    if (pwd.length < 6) {
      return NextResponse.json({ error: "La contrasena debe tener al menos 6 caracteres." }, { status: 400 })
    }
    updateData.password_hash = await hashPassword(pwd)
  }

  const { error } = await supabase.from("users").update(updateData).eq("id", userId)

  if (error) {
    return NextResponse.json({ error: "Error al actualizar el usuario." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "Usuario actualizado exitosamente." })
}
