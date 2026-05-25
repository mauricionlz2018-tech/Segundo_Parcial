import { NextResponse } from "next/server"
import { createPasswordReset, findUserByEmailOrUsername } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const identifier = String(body?.identifier ?? "").trim().toLowerCase()

  if (!identifier) {
    return NextResponse.json({ error: "Ingresa tu usuario o correo." }, { status: 400 })
  }

  const user = await findUserByEmailOrUsername(identifier)
  if (!user) {
    // No revelar si la cuenta existe o no (seguridad)
    return NextResponse.json({ ok: true })
  }

  try {
    const token = await createPasswordReset(user.id)
    
    // Enviar email con el token (sin bloquear si falla)
    sendPasswordResetEmail(user.email, token, user.full_name || user.username)
      .catch((error) => {
        console.error("Error enviando email de recuperación:", error.message)
        // Log del error pero no fallar
      })
    
    // Siempre devolver el mismo mensaje sin revelar el token
    return NextResponse.json({ 
      ok: true,
      message: "Se ha enviado un correo con el token de recuperación"
    })
  } catch (error) {
    console.error("Error en request-reset:", error)
    // En desarrollo, no fallar. En producción, responder con error
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "No se pudo procesar la solicitud." }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }
}
