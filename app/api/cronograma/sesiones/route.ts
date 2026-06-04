import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const sesiones = (await pool.query(
      `SELECT 
        s.id, s.titulo, s.ponente, s.dia, s.hora_inicio, s.hora_fin,
        s.tipo, s.lugar, s.cupos_total, s.cupos_ocupados, s.descripcion,
        s.perfil_profesional, s.afiliacion, s.biografia,
        GROUP_CONCAT(us.user_id) AS inscritos_user_ids
      FROM sesiones s
      LEFT JOIN user_sesiones us ON s.id = us.sesion_id
      GROUP BY s.id
      ORDER BY s.dia ASC, s.hora_inicio ASC`
    )) as any[]

    const grouped: Record<string, any[]> = {}
    sesiones.forEach((sesion) => {
      if (!grouped[sesion.dia]) {
        grouped[sesion.dia] = []
      }
      grouped[sesion.dia].push(sesion)
    })

    return NextResponse.json({ grouped })
  } catch (error) {
    console.error("Error obteniendo cronograma:", error)
    return NextResponse.json(
      { error: "Error al obtener cronograma" },
      { status: 500 }
    )
  }
}
