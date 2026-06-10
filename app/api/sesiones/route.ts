import { NextRequest, NextResponse } from "next/server"
import supabase from "@/lib/db"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sesiones")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error al obtener sesiones:", error)
    return NextResponse.json({ error: "Error al obtener sesiones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("sesiones")
      .insert({
        titulo: body.titulo ?? null,
        ponente: body.ponente ?? null,
        dia: body.dia ?? null,
        hora_inicio: body.hora_inicio ?? null,
        hora_fin: body.hora_fin ?? null,
        tipo: body.tipo ?? "Conferencia",
        lugar: body.lugar ?? null,
        cupos_total: body.cupos_total ?? 50,
        cupos_ocupados: 0,
        descripcion: body.descripcion ?? null,
        foto_ponente: body.foto_ponente ?? null,
        perfil_profesional: String(body.perfil_profesional ?? "").trim() || null,
        afiliacion: String(body.afiliacion ?? "").trim() || null,
        biografia: String(body.biografia ?? "").trim() || null,
        logo_institucion: body.logo_institucion ?? null,
      })
      .select("id")
      .single()

    if (error) throw error

    return NextResponse.json(
      { success: true, message: "Sesion creada exitosamente", id: data.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear sesion:", error)
    return NextResponse.json({ success: false, error: "Error al crear la sesion" }, { status: 500 })
  }
}
