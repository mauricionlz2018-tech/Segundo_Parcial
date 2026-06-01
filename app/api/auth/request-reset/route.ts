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
    console.log("📧 Iniciando proceso de reset para:", identifier)
    const token = await createPasswordReset(user.id)
    console.log("🔑 Token creado:", token.substring(0, 10) + "...")
    
    // Enviar email con el token
    try {
      console.log("📨 Enviando email a:", user.email)
      console.log("🔧 RESEND_API_KEY configurada:", !!process.env.RESEND_API_KEY)
      console.log("🔧 RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL)
      
      const result = await sendPasswordResetEmail(user.email, token, user.full_name || user.username)
      console.log(`✅ Email de reset enviado a: ${user.email}`, { result })
    } catch (error) {
      console.error("⚠️ Error enviando email de recuperación:", error)
      // Continuar incluso si el email falla
    }
    
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
