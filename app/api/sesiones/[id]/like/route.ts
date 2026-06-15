import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import pool from "@/lib/db"

export const runtime = "nodejs"

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return await getUserBySessionToken(token)
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { id: sesionId } = await params

  try {
    const result = await pool.query(
      "INSERT INTO sesion_likes (user_id, sesion_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id",
      [user.id, sesionId]
    )

    const total = await pool.query(
      "SELECT COUNT(*)::int as count FROM sesion_likes WHERE sesion_id = $1",
      [sesionId]
    )

    if (result.rowCount && result.rowCount > 0) {
      return NextResponse.json({ liked: true, total: total.rows[0]?.count ?? 0 })
    }

    return NextResponse.json({ liked: true, total: total.rows[0]?.count ?? 0 })
  } catch (error) {
    console.error("Error registrando like:", error)
    return NextResponse.json({ error: "Error al registrar like." }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { id: sesionId } = await params

  try {
    await pool.query(
      "DELETE FROM sesion_likes WHERE user_id = $1 AND sesion_id = $2",
      [user.id, sesionId]
    )

    const total = await pool.query(
      "SELECT COUNT(*)::int as count FROM sesion_likes WHERE sesion_id = $1",
      [sesionId]
    )

    return NextResponse.json({ liked: false, total: total.rows[0]?.count ?? 0 })
  } catch (error) {
    console.error("Error eliminando like:", error)
    return NextResponse.json({ error: "Error al remover like." }, { status: 500 })
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sesionId } = await params

  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*)::int as count FROM sesion_likes WHERE sesion_id = $1",
      [sesionId]
    )

    const userId = (await getAuthUser())?.id ?? null
    let liked = false
    if (userId) {
      const likeResult = await pool.query(
        "SELECT id FROM sesion_likes WHERE user_id = $1 AND sesion_id = $2 LIMIT 1",
        [userId, sesionId]
      )
      liked = likeResult.rows.length > 0
    }

    return NextResponse.json({ total: totalResult.rows[0]?.count ?? 0, liked })
  } catch (error) {
    console.error("Error obteniendo likes:", error)
    return NextResponse.json(
      { error: "Error al obtener likes." },
      { status: 500 }
    )
  }
}
