import { NextResponse } from "next/server"
import { findUserByEmailOrUsername } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import { query } from "@/lib/db"

export const runtime = "nodejs"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const identifier = String(body?.identifier ?? "").trim().toLowerCase()

  if (!identifier) {
    return NextResponse.json({ error: "Ingresa tu usuario o correo." }, { status: 400 })
  }

  const user = await findUserByEmailOrUsername(identifier)
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  try {
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // ✅ PostgreSQL usa $1, $2... en lugar de ?
    await query(
      `DELETE FROM password_resets WHERE user_id = $1`,
      [user.id]
    )
    await query(
      `INSERT INTO password_resets (user_id, code, expires_at, used) VALUES ($1, $2, $3, false)`,
      [user.id, code, expiresAt]
    )

    console.log("📧 Enviando código a:", user.email)

    try {
      await sendPasswordResetEmail(user.email, code, user.full_name || user.username)
      console.log("✅ Código enviado a:", user.email)
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError)
      return NextResponse.json(
        { error: "No se pudo enviar el correo. Intenta de nuevo." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Se envió un código de 6 dígitos a tu correo.",
    })
  } catch (error) {
    console.error("Error en request-reset:", error)
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud." },
      { status: 500 }
    )
  }
}