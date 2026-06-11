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

// DELETE - desregistrarse de una sesión
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
    // Verificar que el usuario está registrado en esta sesión
    const registroResult = await pool.query(
      "SELECT id FROM user_sesiones WHERE user_id = $1 AND sesion_id = $2",
      [user.id, sesionId]
    )
    if (!registroResult || registroResult.rowCount === 0) {
      return NextResponse.json({ error: "No estás registrado en esta sesión." }, { status: 404 })
    }

    // Eliminar registro
    await pool.query(
      "DELETE FROM user_sesiones WHERE user_id = $1 AND sesion_id = $2",
      [user.id, sesionId]
    )

    // Decrementar cupos ocupados
    await pool.query(
      "UPDATE sesiones SET cupos_ocupados = GREATEST(0, cupos_ocupados - 1) WHERE id = $1",
      [sesionId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error desregistrando sesión:", error)
    return NextResponse.json({ error: "Error al desregistrar sesión." }, { status: 500 })
  }
}
