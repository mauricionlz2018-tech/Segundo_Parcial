import { NextResponse } from "next/server"
import supabase from "@/lib/db"

export async function GET() {
  try {
    const { data: sesiones, error } = await supabase
      .from("sesiones")
      .select(
        "id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, perfil_profesional, afiliacion, biografia, foto_ponente"
      )
      .order("dia", { ascending: true })
      .order("hora_inicio", { ascending: true })

    if (error) throw error

    const grouped: Record<string, typeof sesiones> = {}
    ;(sesiones ?? []).forEach((sesion) => {
      const dia = sesion.dia as string
      if (!grouped[dia]) grouped[dia] = []
      grouped[dia]!.push(sesion)
    })

    return NextResponse.json({ data: grouped })
  } catch (error) {
    console.error("Error al obtener sesiones:", error)
    return NextResponse.json({ error: "Error al obtener sesiones" }, { status: 500 })
  }
}
