import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 })
    }

    // Obtener sesiones inscritas del usuario
    const sesiones = await pool.query(
      `SELECT 
        s.id, s.titulo, s.ponente, s.dia, s.hora_inicio, s.hora_fin,
        s.tipo, s.lugar, s.cupos_total, s.cupos_ocupados, s.descripcion,
        s.perfil_profesional, s.afiliacion, s.biografia,
        us.registered_at
      FROM sesiones s
      INNER JOIN user_sesiones us ON s.id = us.sesion_id
      WHERE us.user_id = ?
      ORDER BY s.dia ASC, s.hora_inicio ASC`,
      [userId]
    )

    return NextResponse.json({
      data: sesiones,
      total: sesiones.length,
    })
  } catch (error) {
    console.error("Error al obtener sesiones inscritas:", error)
    return NextResponse.json(
      { error: "Error al obtener sesiones inscritas" },
      { status: 500 }
    )
  }
}
