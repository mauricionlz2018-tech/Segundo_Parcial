import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import supabase from "@/lib/db"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const user = await getUserBySessionToken(token)
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  return NextResponse.json({ user })
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const user = await getUserBySessionToken(token)
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const fullName = body?.full_name ? String(body.full_name).trim() : null
  const carrera = body?.carrera ? String(body.carrera).trim() : null

  if (!fullName) {
    return NextResponse.json({ error: "El nombre completo es requerido." }, { status: 400 })
  }

  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName, carrera: carrera ?? null })
    .eq("id", user.id)

  if (error) {
    return NextResponse.json({ error: "Error al actualizar el perfil." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "Perfil actualizado exitosamente." })
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const user = await getUserBySessionToken(token)
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const confirmEmail = body?.confirm_email

  if (confirmEmail !== user.email) {
    return NextResponse.json({ error: "Confirmacion de email incorrecta." }, { status: 400 })
  }

  // Eliminar sesiones del usuario (el CASCADE en la BD ya lo hace, pero lo hacemos explícito)
  await supabase.from("sessions").delete().eq("user_id", user.id)

  // Eliminar el usuario
  const { error } = await supabase.from("users").delete().eq("id", user.id)

  if (error) {
    return NextResponse.json({ error: "Error al eliminar la cuenta." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: "Cuenta eliminada exitosamente." })
}
