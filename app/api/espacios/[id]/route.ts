import { NextResponse } from "next/server"
import supabase from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const nombre = String(body?.nombre ?? "").trim()
  const descripcion = String(body?.descripcion ?? "").trim()
  const capacidad_maxima = Number(body?.capacidad_maxima ?? 50)

  if (!nombre) {
    return NextResponse.json({ error: "El nombre del espacio es requerido." }, { status: 400 })
  }

  if (capacidad_maxima < 1) {
    return NextResponse.json({ error: "La capacidad debe ser mayor a 0." }, { status: 400 })
  }

  const { count } = await supabase
    .from("espacios")
    .select("id", { count: "exact", head: true })
    .eq("id", id)

  if (!count) {
    return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 })
  }

  const { error } = await supabase
    .from("espacios")
    .update({ nombre, descripcion: descripcion || null, capacidad_maxima })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ success: false, error: "Error al actualizar el espacio" }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: "Espacio actualizado exitosamente" })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { count } = await supabase
    .from("espacios")
    .select("id", { count: "exact", head: true })
    .eq("id", id)

  if (!count) {
    return NextResponse.json({ error: "Espacio no encontrado" }, { status: 404 })
  }

  const { error } = await supabase.from("espacios").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ success: false, error: "Error al eliminar el espacio" }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: "Espacio eliminado exitosamente" })
}
