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
    await sendPasswordResetEmail(user.email, token, user.full_name || user.username)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en request-reset:", error)
    return NextResponse.json({ error: "No se pudo procesar la solicitud." }, { status: 500 })
  }
}
