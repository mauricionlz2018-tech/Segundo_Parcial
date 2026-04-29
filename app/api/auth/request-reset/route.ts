import { NextResponse } from "next/server"
import { createPasswordReset, findUserByEmailOrUsername } from "@/lib/auth"

export const runtime = "nodejs"

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

  const token = await createPasswordReset(user.id)
  const payload: Record<string, string | boolean> = { ok: true }

  if (process.env.NODE_ENV !== "production") {
    payload.resetToken = token
  }

  return NextResponse.json(payload)
}
