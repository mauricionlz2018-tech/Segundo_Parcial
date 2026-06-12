import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"

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

  await pool.query(
    "UPDATE users SET full_name = $1, carrera = $2 WHERE id = $3",
    [fullName, carrera || null, user.id]
  )

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
    return NextResponse.json(
      { error: "Confirmación de email incorrecta." },
      { status: 400 }
    )
  }

  // Eliminar sesiones del usuario
  await pool.query("DELETE FROM sessions WHERE user_id = $1", [user.id])

  // Eliminar el usuario
  await pool.query("DELETE FROM users WHERE id = $1", [user.id])

  return NextResponse.json({
    ok: true,
    message: "Cuenta eliminada exitosamente.",
  })
}
