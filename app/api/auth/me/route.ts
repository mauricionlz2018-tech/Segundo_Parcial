import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"

export const runtime = "nodejs"

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
