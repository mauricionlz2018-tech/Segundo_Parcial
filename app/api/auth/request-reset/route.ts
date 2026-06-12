import { NextResponse } from "next/server"
import { findUserByEmailOrUsername } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import pool from "@/lib/db"

export const runtime = "nodejs"

// Genera un código de 6 dígitos
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
    // No revelar si la cuenta existe (seguridad)
    return NextResponse.json({ ok: true })
  }

  try {
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // expira en 15 minutos

    // Guardar el código en la base de datos
    // IMPORTANTE: asegúrate de tener una tabla password_resets con columnas:
    // user_id, code, expires_at, used
    await pool.query(
      `DELETE FROM password_resets WHERE user_id = ?`,
      [user.id]
    )
    await pool.query(
      `INSERT INTO password_resets (user_id, code, expires_at, used) VALUES (?, ?, ?, 0)`,
      [user.id, code, expiresAt]
    )

    console.log("📧 Enviando código de recuperación a:", user.email)

    try {
      // Ajusta sendPasswordResetEmail para recibir el código en lugar del token
      await sendPasswordResetEmail(user.email, code, user.full_name || user.username)
      console.log("✅ Código enviado a:", user.email)
    } catch (emailError) {
      console.error("❌ Error enviando email:", emailError)
      // Si el email falla retornamos error claro (en dev puedes ver el código en logs)
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