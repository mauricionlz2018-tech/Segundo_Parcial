import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tipo = url.searchParams.get("tipo")
    const dia = url.searchParams.get("dia")
    const userId = url.searchParams.get("userId") // Para saber cuáles ya está inscrito

    let query = `
      SELECT 
        s.id, s.titulo, s.ponente, s.dia, s.hora_inicio, s.hora_fin,
        s.tipo, s.lugar, s.cupos_total, s.cupos_ocupados, s.descripcion,
        s.perfil_profesional, s.afiliacion, s.biografia
    `
    
    // Si hay userId, agrega el campo inscrito
    if (userId) {
      query += `, (CASE 
        WHEN EXISTS(
          SELECT 1 FROM user_sesiones us 
          WHERE us.sesion_id = s.id AND us.user_id = ?
        ) THEN 1 
        ELSE 0 
      END) as inscrito`
    } else {
      query += `, 0 as inscrito`
    }
    
    query += ` FROM sesiones s WHERE 1=1`
    
    const params: any[] = []
    
    // Agregar userId al inicio de params si existe
    if (userId) {
      params.push(userId)
    }

    if (tipo) {
      query += ` AND s.tipo = ?`
      params.push(tipo)
    }

    if (dia) {
      query += ` AND s.dia = ?`
      params.push(dia)
    }

    query += ` ORDER BY s.dia ASC, s.hora_inicio ASC`

    const sesiones = await pool.query(query, params)

    return NextResponse.json({
      data: sesiones,
      total: sesiones.length,
    })
  } catch (error) {
    console.error("Error al obtener sesiones disponibles:", error)
    return NextResponse.json(
      { error: "Error al obtener sesiones disponibles" },
      { status: 500 }
    )
  }
}
