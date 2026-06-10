import { NextResponse } from "next/server"
import supabase from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const tipo = url.searchParams.get("tipo")
    const dia = url.searchParams.get("dia")
    const userId = url.searchParams.get("userId")

    let queryBuilder = supabase
      .from("sesiones")
      .select(
        "id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, perfil_profesional, afiliacion, biografia"
      )
      .order("dia", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (tipo) queryBuilder = queryBuilder.eq("tipo", tipo)
    if (dia) queryBuilder = queryBuilder.eq("dia", dia)

    const { data: sesiones, error } = await queryBuilder
    if (error) throw error

    // Enriquecer con campo "inscrito" si se provee userId
    if (userId && sesiones) {
      const { data: inscripciones } = await supabase
        .from("user_sesiones")
        .select("sesion_id")
        .eq("user_id", userId)

      const inscritasIds = new Set((inscripciones ?? []).map((i) => i.sesion_id))
      const sesionesConInscrito = sesiones.map((s) => ({
        ...s,
        inscrito: inscritasIds.has(s.id) ? 1 : 0,
      }))

      return NextResponse.json({ data: sesionesConInscrito, total: sesionesConInscrito.length })
    }

    const data = (sesiones ?? []).map((s) => ({ ...s, inscrito: 0 }))
    return NextResponse.json({ data, total: data.length })
  } catch (error) {
    console.error("Error al obtener sesiones disponibles:", error)
    return NextResponse.json({ error: "Error al obtener sesiones disponibles" }, { status: 500 })
  }
}
