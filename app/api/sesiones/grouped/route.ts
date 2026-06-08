import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const sesiones = await query<any[]>(
      `SELECT id, titulo, ponente, dia, hora_inicio, hora_fin,
              tipo, lugar, cupos_total, cupos_ocupados,
              descripcion, perfil_profesional, afiliacion, biografia, foto_ponente
       FROM sesiones
       ORDER BY dia ASC, hora_inicio ASC`
    )

    const grouped: Record<string, any[]> = {}
    sesiones.forEach((sesion) => {
      if (!grouped[sesion.dia]) grouped[sesion.dia] = []
      grouped[sesion.dia].push(sesion)
    })

    return NextResponse.json({ data: grouped })
  } catch (error) {
    console.error('Error al obtener sesiones:', error)
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    )
  }
}
