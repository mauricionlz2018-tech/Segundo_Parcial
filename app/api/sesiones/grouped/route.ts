import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const sesiones = await query(
      'SELECT * FROM sesiones ORDER BY dia ASC, hora_inicio ASC'
    )

    // Agrupar por día
    const grouped: Record<string, any[]> = {}
    sesiones.forEach((sesion: any) => {
      if (!grouped[sesion.dia]) {
        grouped[sesion.dia] = []
      }
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
