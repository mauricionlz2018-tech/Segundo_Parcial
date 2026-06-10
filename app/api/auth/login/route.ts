import { NextResponse } from "next/server"
import { createSession, findUserByEmailOrUsername, SESSION_COOKIE, verifyPassword } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const identifier = String(body?.identifier ?? "").trim().toLowerCase()
    const password = String(body?.password ?? "")

    if (!identifier || !password) {
      return NextResponse.json({ error: "Faltan datos para iniciar sesion." }, { status: 400 })
    }

    const user = await findUserByEmailOrUsername(identifier)
    if (!user) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 })
    }

    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 })
    }

    const session = await createSession(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        carrera: user.carrera,
        created_at: user.created_at,
      },
    })

    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    })

    return response
  } catch (err) {
    console.error("[login] Error interno:", err)
    return NextResponse.json(
      { error: "Error interno del servidor. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
