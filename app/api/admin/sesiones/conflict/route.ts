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

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dia = String(searchParams.get("dia") ?? "").trim()
  const horaInicio = String(searchParams.get("horaInicio") ?? "").trim()
  const horaFin = String(searchParams.get("horaFin") ?? "").trim()
  const lugar = String(searchParams.get("lugar") ?? "").trim()
  const excludeId = String(searchParams.get("excludeId") ?? "").trim()

  if (!dia || !horaInicio || !horaFin || !lugar) {
    return NextResponse.json({ conflict: false })
  }

  const rows = await query(
    `SELECT id, titulo, hora_inicio::text, hora_fin::text
     FROM sesiones
     WHERE dia = $1
       AND lugar = $2
       AND id <> $3
       AND hora_inicio < $4::time
       AND hora_fin > $5::time`,
    [dia, lugar, excludeId, horaFin, horaInicio]
  )

  if (rows.length > 0) {
    const conflicto = rows[0]
    return NextResponse.json({
      conflict: true,
      error: `Conflicto de horario: ya existe la sesión "${conflicto.titulo}" en "${lugar}" de ${conflicto.hora_inicio} a ${conflicto.hora_fin}. No se pueden tener dos sesiones en el mismo lugar y horario.`,
    })
  }

  return NextResponse.json({ conflict: false })
}
