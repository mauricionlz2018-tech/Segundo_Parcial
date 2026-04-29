import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import { query } from "@/lib/db"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const rows = await query(
    "select id, username, full_name, role, created_at from users order by created_at desc"
  )

  return NextResponse.json({ data: rows })
}
