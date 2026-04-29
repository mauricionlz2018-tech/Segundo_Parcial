import { NextResponse } from "next/server"
import { hashPassword, resetPasswordWithToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const token = String(body?.token ?? "").trim()
  const password = String(body?.password ?? "")

  if (!token || !password) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 6 caracteres." }, { status: 400 })
  }

  const passwordHash = await hashPassword(password)
  const ok = await resetPasswordWithToken(token, passwordHash)

  if (!ok) {
    return NextResponse.json({ error: "Token invalido o expirado." }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
