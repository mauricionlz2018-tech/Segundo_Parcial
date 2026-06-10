import { NextRequest, NextResponse } from "next/server"
import supabase from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { error: checkError, count } = await supabase
      .from("sesiones")
      .select("id", { count: "exact", head: true })
      .eq("id", id)

    if (checkError || !count) {
      return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 })
    }

    const { error } = await supabase
      .from("sesiones")
      .update({
        titulo: body.titulo ?? null,
        ponente: body.ponente ?? null,
        dia: body.dia ?? null,
        hora_inicio: body.hora_inicio ?? null,
        hora_fin: body.hora_fin ?? null,
        tipo: body.tipo ?? "Conferencia",
        lugar: body.lugar ?? null,
        cupos_total: body.cupos_total ?? 50,
        descripcion: body.descripcion ?? null,
        foto_ponente: body.foto_ponente ?? null,
        perfil_profesional: String(body.perfil_profesional ?? "").trim() || null,
        afiliacion: String(body.afiliacion ?? "").trim() || null,
        biografia: String(body.biografia ?? "").trim() || null,
        logo_institucion: body.logo_institucion ?? null,
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Sesion actualizada exitosamente" })
  } catch (error) {
    console.error("Error al actualizar:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar la sesion" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { count } = await supabase
      .from("sesiones")
      .select("id", { count: "exact", head: true })
      .eq("id", id)

    if (!count) {
      return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 })
    }

    const { error } = await supabase.from("sesiones").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ success: true, message: "Sesion eliminada exitosamente" })
  } catch (error) {
    console.error("Error al eliminar:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar la sesion" }, { status: 500 })
  }
}
